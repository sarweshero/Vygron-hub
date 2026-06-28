"""
Management command to load a JSON database dump.
Can load to local PostgreSQL or any configured database.
"""
import json
import os

from django.core.management.base import BaseCommand
from django.core import serializers


class Command(BaseCommand):
    help = "Load a JSON database dump into the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "input",
            type=str,
            help="Input JSON dump file path",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before loading",
        )
        parser.add_argument(
            "--verbosity",
            type=int,
            default=1,
            help="Verbosity level (0=silent, 1=normal, 2=verbose)",
        )

    def handle(self, *args, **options):
        input_file = options["input"]
        clear = options["clear"]

        if not os.path.exists(input_file):
            self.stdout.write(
                self.style.ERROR(f"File not found: {input_file}")
            )
            return

        self.stdout.write(self.style.NOTICE(f"Loading data from {input_file}..."))

        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not data:
            self.stdout.write(self.style.WARNING("No data found in file"))
            return

        self.stdout.write(f"Found {len(data)} objects to load")

        # Group by model
        models_data = {}
        for obj in data:
            model = obj["model"]
            if model not in models_data:
                models_data[model] = []
            models_data[model].append(obj)

        self.stdout.write(f"Models found: {', '.join(models_data.keys())}")

        if clear:
            self.stdout.write(self.style.WARNING("Clearing existing data..."))
            from django.apps import apps

            for model_name in models_data.keys():
                try:
                    app_label, model_name = model_name.split(".")
                    model = apps.get_model(app_label, model_name)
                    model.objects.all().delete()
                    if options["verbosity"] >= 1:
                        self.stdout.write(f"  Cleared {app_label}.{model_name}")
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f"  Could not clear {model_name}: {e}")
                    )

        # Load data
        self.stdout.write("Loading data...")
        try:
            objects = serializers.deserialize("json", data, handle_m2m=True)
            count = 0
            for obj in objects:
                obj.save()
                count += 1
                if options["verbosity"] >= 2:
                    self.stdout.write(f"  Saved: {obj.object}")

            self.stdout.write(
                self.style.SUCCESS(f"\nLoad complete: {count} objects loaded")
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error loading data: {e}"))
            raise
