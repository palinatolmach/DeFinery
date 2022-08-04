apt update && apt upgrade -y && apt install -y build-essential libboost-all-dev cmake curl zip unzip tar # python3.7 git

git clone https://github.com/Microsoft/vcpkg.git &&\
    cd vcpkg &&\
    ./bootstrap-vcpkg.sh &&\
    ./vcpkg integrate install &&\
    ./vcpkg install jsoncpp

git clone https://github.com/Z3Prover/z3.git &&\
   cd z3 && \
   git checkout z3-4.8.13 &&\
   python scripts/mk_make.py &&\
   cd build &&\
   make &&\
   make install && cd ../..

unzip definery-see.zip
chmod +x ./definery-see

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash &&\
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" &&\
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" &&\
    nvm install 14 &&\
    nvm use 14
   
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" &&\
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" &&\
    cd SCRepair/sm &&\
    npm install && npm run-script build && cd ../

# curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py &&\
#     python3.7 ./get-pip.py &&\
#     rm get-pip.py

python3.7 setup.py install

pip install attrs charset_normalizer logbook deap docker

mkdir contracts && mkdir experiments

cp -r ../contracts/eval/* ./contracts/
cp ../definery-see ./
