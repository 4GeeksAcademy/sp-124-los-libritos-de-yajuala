#!/usr/bin/env bash
# exit on error
set -o errexit

npm install --legacy-peer-deps
npm run build
pip install -r requirements.txt
cd src && FLASK_APP=app.py flask db upgrade
