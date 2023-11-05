## API credentials
To use the Kaggle API, sign up for a Kaggle account at https://www.kaggle.com. Then go to the 'Account' tab of your user profile (https://www.kaggle.com/*username*/account) and select 'Create API Token'. This will trigger the download of kaggle.json, a file containing your API credentials. Place this file in the location ~/.kaggle/kaggle.json (on Windows in the location C:\Users\\*Windows-username*.kaggle\kaggle.json - you can check the exact location, sans drive, with echo %HOMEPATH%). You can define a shell environment variable KAGGLE_CONFIG_DIR to change this location to $KAGGLE_CONFIG_DIR/kaggle.json (on Windows it will be %KAGGLE_CONFIG_DIR%\kaggle.json).

For your security, ensure that other users of your computer do not have read access to your credentials. On Unix-based systems you can do this with the following command:
```
chmod 600 ~/.kaggle/kaggle.json
```
You can also choose to export your Kaggle username and token to the environment:
```
export KAGGLE_USERNAME=datadinosaur
export KAGGLE_KEY=xxxxxxxxxxxxxx
```
In addition, you can export any other configuration value that normally would be in the $HOME/.kaggle/kaggle.json in the format 'KAGGLE_' (note uppercase).
For example, if the file had the variable "proxy" you would export KAGGLE_PROXY and it would be discovered by the client.