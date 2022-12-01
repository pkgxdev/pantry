#!/bin/sh

CMD_NAME=$1
PROJECT_NAME=$2

python -m venv $PREFIX/libexec

cd "$PREFIX"

libexec/bin/pip install -v --no-deps --no-binary :all: --ignore-installed $CMD_NAME
mkdir bin

mv libexec/bin/$CMD_NAME libexec/bin/$CMD_NAME.py

cd bin
ln -s ../libexec/bin/$CMD_NAME $CMD_NAME

cd ../libexec/bin
fix-shebangs.ts *

cp "$SRCROOT"/props/shim.bash $CMD_NAME
chmod +x $CMD_NAME

rm Activate.ps1 activate.csh activate.fish

sed -i.bak 's|VIRTUAL_ENV=".*"|VIRTUAL_ENV="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. \&\& pwd)"|' activate
rm activate.bak

# FIXME a lot: this "updates" the `venv` on each run for relocatability
cat <<EOF>>activate

sed -i.bak \\
  -e "s|$TEA_PREFIX/python.org/v$PYTHON_VERSION|\$TEA_PREFIX/python.org/v$PYTHON_VERSION_MAJ|" \\
  -e 's|bin/python$PYTHON_VERSION_MAJ.$PYTHON_VERSION_MIN|bin/python|' \\
  -e "s|$PREFIX/libexec|\$TEA_PREFIX/$PROJECT_NAME/v$VERSION/libexec|" \\
  \$VIRTUAL_ENV/pyvenv.cfg
rm \$VIRTUAL_ENV/pyvenv.cfg.bak
EOF

for x in python*; do
  ln -sf ../../../../python.org/v$PYTHON_VERSION_MAJ/bin/$x $x
done