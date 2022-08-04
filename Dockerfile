FROM ubuntu:18.04

RUN apt update && apt upgrade -y && apt install -y build-essential libboost-all-dev python3.7 cmake git curl zip unzip tar

RUN git clone https://github.com/Microsoft/vcpkg.git &&\
    cd vcpkg &&\
    ./bootstrap-vcpkg.sh &&\
    ./vcpkg integrate install &&\
    ./vcpkg install jsoncpp

RUN \
   mkdir -p temp && cd /temp &&\
   git clone https://github.com/Z3Prover/z3.git &&\
   cd z3 && \
   git checkout z3-4.8.13 &&\
   python scripts/mk_make.py &&\
   cd build &&\
   make &&\
   make install

WORKDIR /app

RUN git clone https://github.com/polinatolmach/DeFinery.git
RUN cp -r /app/DeFinery/* /app/

RUN unzip definery-see.zip
RUN chmod +x ./definery-see

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash &&\
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" &&\
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" &&\
    nvm install 14 &&\
    nvm use 14

RUN export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" &&\
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" &&\
    cd SCRepair/sm &&\
    npm install && npm run-script build

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py &&\
    python3.7 ./get-pip.py &&\
    rm get-pip.py

RUN cd SCRepair &&\
    python3.7 setup.py install

RUN cd SCRepair &&\
    pip install attrs charset_normalizer logbook deap docker

RUN mkdir /contracts && mkdir /experiments

RUN cp /app/contracts/eval/* /contracts/

ENTRYPOINT ["/bin/bash", "/app/start.sh"]