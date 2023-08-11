# Running with Colima
Colima is a lightweight and straightforward command-line tool that simplifies the management of Docker on macOS. This guide will walk you through the steps to set up and run Docker using Colima.


## Starting Colima

To start Colima, simply execute:

```bash
colima start <name>
```

## Setting socket
`docker context use colima-<name>`

## Using Docker with Colima

Now that Colima is running, you can use Docker commands directly from your terminal just like you would with a regular Docker installation. For example, to pull and run a Docker container:

```bash
docker pull nginx
docker run -d -p 80:80 nginx
```

## Stopping Colima

When you're done using Docker with Colima, you can stop Colima and shut down Docker Desktop by running:

```bash
colima stop
```