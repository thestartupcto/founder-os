"""
PyInstaller entry point. Do not import with relative imports.
Run: python backend/server.py [--port 8765]
"""
import sys
import os
import argparse

# When frozen by PyInstaller, sys._MEIPASS has bundled files.
# When running from source, add project root to path.
if getattr(sys, 'frozen', False):
    sys.path.insert(0, sys._MEIPASS)
else:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, root)

import uvicorn  # noqa: E402 (after path setup)
from backend.main import app  # noqa: E402


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    uvicorn.run(app, host='127.0.0.1', port=args.port, log_level='warning')


if __name__ == '__main__':
    main()
