#! /bin/bash
# Check if there is one argument "migration message"
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <migration message>"
    exit 1
fi

# Check if PYTHONPATH contains the project directory, if not, do the export
if [[ ":$PYTHONPATH:" != *":/Users/cve/GITHUB/spt/spt.ai:"* ]]; then
    export PYTHONPATH="/Users/cve/GITHUB/spt/spt.ai:$PYTHONPATH"
fi

# Navigate to the app directory
cd app && alembic revision --autogenerate -m "$1" && alembic upgrade head