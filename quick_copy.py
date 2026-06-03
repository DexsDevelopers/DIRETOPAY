import os
import shutil

src = r"D:\diretopay\dashboard-new\dist\assets"
dst = r"D:\diretopay\assets\dashboard-react"

count = 0
for f in os.listdir(src):
    s = os.path.join(src, f)
    d = os.path.join(dst, f)
    if os.path.isfile(s):
        shutil.copy2(s, d)
        count += 1

print(f"OK: {count} files copied")
