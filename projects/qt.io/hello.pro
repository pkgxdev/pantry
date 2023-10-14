QT             += core
QT             -= gui
TARGET         =  hello
CONFIG         += console
CONFIG         -= app_bundle
TEMPLATE       =  app
SOURCES        += main.cpp
QMAKE_CXXFLAGS += -Wl,-rpath,$$(PKGX_DIR)
