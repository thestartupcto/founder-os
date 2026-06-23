# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec — onedir mode (onefile fails on macOS SIP temp restrictions)
from PyInstaller.utils.hooks import collect_all

block_cipher = None

datas_fastapi,   binaries_fastapi,   hiddens_fastapi   = collect_all('fastapi')
datas_uvicorn,   binaries_uvicorn,   hiddens_uvicorn   = collect_all('uvicorn')
datas_starlette, binaries_starlette, hiddens_starlette = collect_all('starlette')
datas_anyio,     binaries_anyio,     hiddens_anyio     = collect_all('anyio')
datas_pydantic,  binaries_pydantic,  hiddens_pydantic  = collect_all('pydantic')
datas_h11,       binaries_h11,       hiddens_h11       = collect_all('h11')

all_datas    = datas_fastapi + datas_uvicorn + datas_starlette + datas_anyio + datas_pydantic + datas_h11
all_binaries = binaries_fastapi + binaries_uvicorn + binaries_starlette + binaries_anyio + binaries_pydantic + binaries_h11
all_hiddens  = hiddens_fastapi + hiddens_uvicorn + hiddens_starlette + hiddens_anyio + hiddens_pydantic + hiddens_h11

a = Analysis(
    ['backend/server.py'],
    pathex=['.'],
    binaries=all_binaries,
    datas=all_datas,
    hiddenimports=all_hiddens + [
        'jaraco.text',
        'jaraco.functools',
        'jaraco.context',
        'more_itertools',
        'sqlite3',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='founder-os-backend',
    debug=False,
    strip=False,
    upx=False,
    console=True,
    argv_emulation=False,
    target_arch=None,
)

# onedir — produces dist/founder-os-backend/ folder
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    name='founder-os-backend',
)
