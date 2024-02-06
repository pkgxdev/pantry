#include <stdio.h>
#include "portaudio.h"
int main()
{
  printf("%s",Pa_GetVersionInfo()->versionText);
}