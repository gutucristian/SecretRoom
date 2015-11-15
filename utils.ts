class Utils {
    // Checks for primitive duplicates in array
    public arrayIsUnique = (array) => {
        array.sort();
        for (var i = 1; i < array.length; i++) {
            if (array[i - 1] == array[i])
                return false;
        }
        return true;
    };

    //overwrite Array.prototype.equals to check equality for content
    public arrayEquals = (thisArray, otherArray) => {
        // if the other array is a falsy value, return
        if (!otherArray)
            return false;

        // compare lengths - can save a lot of time
        if (thisArray.length != otherArray.length)
            return false;

        for (var i = 0, l = thisArray.length; i < l; i++) {
            // Check if we have nested arrays
            if (thisArray[i] instanceof Array && otherArray[i] instanceof Array) {
                // recurse into the nested arrays
                if (!thisArray[i].equals(otherArray[i]))
                    return false;
            }
            else if (thisArray[i] != otherArray[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };
}