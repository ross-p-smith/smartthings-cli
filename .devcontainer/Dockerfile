# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.194.0/containers/typescript-node/.devcontainer/base.Dockerfile

FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-16-buster

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends qemu binfmt-support qemu-user-static

# RUN wget https://github.com/SmartThingsCommunity/smartthings-cli/releases/download/%40smartthings%2Fcli%401.0.0-beta.19/smartthings-linux-x64.tar.gz \
#     -O ./cli/smartthings-linux-x64.tar.gz && \
#     tar -xzvf ./cli/smartthings-linux-x64.tar.gz --directory=./cli

