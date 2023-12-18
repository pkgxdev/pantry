import gi
gi.require_version('Gst', '1.0')
from gi.repository import Gst
print (Gst.Fraction(num=3, denom=5))