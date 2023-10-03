import typing_extensions

class Movie(typing_extensions.TypedDict):
    title: str
    year: typing_extensions.NotRequired[int]

m = Movie(title="Grease")