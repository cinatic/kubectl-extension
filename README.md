# [kubectl-extension](https://extensions.gnome.org/)

[![Actions Status: Build & Create Package](https://github.com/cinatic/kubectl-extension/workflows/Build%20%26%20Create%20Package/badge.svg)](https://github.com/cinatic/kubectl-extension/actions?query=workflow%3A"Build+&+Create+Package")
[![Actions Status: Build Package & Create Release](https://github.com/cinatic/kubectl-extension/workflows/Build%20Package%20%26%20Create%20Release/badge.svg)](https://github.com/cinatic/kubectl-extension/actions?query=workflow%3A"Build+Package+&+Create+Release")

An extension for quick access kubernetes resources in GNOME Shell panel utilizing kubectl CLI

<img alt="pods" src="images/pods.png">
<img alt="services" src="images/services.png">

----

## Installation

### Over extensions.gnome.org (EGO)

Install via install button -> TBA

### Generic (Local installation)

Move files into your locale extension directory (~/.local/share/gnome-shell/extensions/kubectl@infinicode.de) and enable
the extension via the Tweak Tool, it is **important** to move it to **kubectl@infinicode.de** otherwise the extension
will not be recognized by GNOME. Restart GNOME Shell (`Alt`+`F2`, `r`, `Enter`) and enable the extension through *
gnome-tweak-tool* or *extensions tool*.

## Data Provider

Data is used from [`kubectl CLI`](https://kubernetes.io/docs/reference/kubectl/overview/), make sure you have it
installed.

## Context usage

The extension uses kubectl contexts, so make sure you have a valid kube configuration. See
also https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/

![Screenshot](images/settings.png)
