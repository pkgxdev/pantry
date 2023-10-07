# Apache ZooKeeper Usage Notes

## Starting the Server

To start the ZooKeeper server, specify the path to your configuration directory using the `ZOOCFGDIR` environment variable:

```bash
export ZOOCFGDIR=/path/to/your/config
zkServer start
```

## Stopping the Server

```bash
zkServer stop
```

That's it! Happy ZooKeeping!