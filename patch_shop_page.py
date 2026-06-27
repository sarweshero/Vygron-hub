import sys

path = r'e:\Project\kurthi\app\[shopSlug]\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = [
    '                           <button \n',
    '                             onClick={() => addToCart(product)}\n',
    '                             className="block w-full py-4 bg-[#F7F3EB] group-hover:bg-[#00A99D] group-hover:text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 hover:shadow-xl flex items-center justify-center gap-2"\n',
    '                           >\n',
    '                             <ShoppingBag size={14} /> Add to Cart\n',
    '                           </button>\n'
]

# We want to replace the Link block which we saw at lines 232-237 (1-indexed)
# In 0-indexed list, that is 231 to 237.
lines[231:237] = new_content

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
