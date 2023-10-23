print('hello, world'.split().reduce(function (sum, char) {
    return sum + char.charCodeAt(0);
}, 0));