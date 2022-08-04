export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

./definery-see -symexe-main /contracts/$1.sol $1

cd SCRepair
python3.7 ./CLI.py --targetContractName $1 repair /experiments/$1/$1.sol