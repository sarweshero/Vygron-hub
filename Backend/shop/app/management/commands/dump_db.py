"""
Management command to dump the database to a JSON file.
Can dump from Supabase (remote) or local PostgreSQL.
"""
import json
import os
from datetime import datetime

from django.core.management.base import BaseCommand
from django.core import serializers


class Command(BaseCommand):
    help = "Dump the database to a JSON file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            type=str,
            default=None,
            help="Output file path (default: dump_YYYYMMDD_HHMMSS.json)",
        )
        parser.add_argument(
            "--indent",
            type=int,
            default=2,
            help="JSON indentation level (default: 2)",
        )
        parser.add_argument(
            "--exclude",
            type=str,
            nargs="*",
            default=["contenttypes", "auth.permission", "sessions"],
            help="App labels to exclude (default: contenttypes auth.permission sessions)",
        )

    def handle(self, *args, **options):
        output = options["output"]
        indent = options["indent"]
        exclude = options["exclude"]

        if not output:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output = f"dump_{timestamp}.json"

        self.stdout.write(self.style.NOTICE(f"Dumping database to {output}..."))

        objects = serializers.serialize(
            "json",
            [],
            indent=indent,
            use_natural_foreign_keys=True,
            use_natural_primary_keys=True,
        )

        # Get all models dynamically
        from django.apps import apps

        all_models = []
        for model in apps.get_models():
            app_label = model._meta.app_label
            model_name = model.__name__.lower()

            # Skip excluded apps
            if app_label in exclude:
                continue

            # Skip Django internal apps
            if app_label in ("admin", "contenttypes"):
                continue

            all_models.append(model)

        # Serialize each model
        all_data = []
        for model in all_models:
            queryset = model.objects.all()
            if queryset.exists():
                serialized = serializers.serialize(
                    "json",
                    queryset,
                    indent=indent,
                    use_natural_foreign_keys=True,
                    use_natural_primary_keys=True,
                )
                data = json.loads(serialized)
                all_data.extend(data)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  {model._meta.label}: {len(data)} objects"
                    )
                )

        # Write to file
        with open(output, "w", encoding="utf-8") as f:
            json.dump(all_data, f, indent=indent, ensure_ascii=False)

        file_size = os.path.getsize(output)
        self.stdout.write(
            self.style.SUCCESS(
                f"\nDump complete: {output} ({len(all_data)} objects, {file_size:,} bytes)"
            )
        )
