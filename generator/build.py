from pathlib import Path
import shutil
import zipfile

root = Path(__file__).resolve().parent
shutil.copyfile(root / 'catalog.json', root / 'extension/catalog.json')
with zipfile.ZipFile(root / 'downloads/genarator-e-perangkat-chrome.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted((root / 'extension').iterdir()):
        if file.is_file():
            archive.write(file, file.name)
print('Extension ZIP created.')
