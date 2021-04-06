function colorStars(star, starsArr, id) {
    for (var i=0; i<=star; i++) {
        starsArr[i].setAttribute('class', 'fas fa-star '+id+'-st');
    }
    if (star<4) {
        for (var i=star+1; i<starsArr.length; i++) {
            starsArr[i].setAttribute('class', 'far fa-star '+id+'-st');
        }
    }
    if (id=='a') {
        starsOut.setAttribute('value', star);
    }
}