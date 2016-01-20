window.onload = function() {
    var documentName = document.location.pathname.substring(1);
    
    var idElement = document.getElementById('id'); 
    
    if (documentName.length > 0) {
        idElement.innerHTML = documentName;
    }
    
    idElement.onfocus = function() {
        window.setTimeout(function() {
            var sel, range;
            if (window.getSelection && document.createRange) {
                range = document.createRange();
                range.selectNodeContents(idElement);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if(document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(idElement);
                range.select();
            }
        }, 1);
    };
    idElement.onblur = function() {
        if(documentName.length > 0) {
            idElement.innerHTML = documentName;
        } else { idElement.innerHTML = '/'; }
    }

    idElement.addEventListener('keypress', function(e) {
        if(e.keyCode === 13) {
            var noSlash = idElement.innerHTML.replace(/[\/]/g, '');
            window.location.href = '/' + noSlash;
            e.preventDefault();
        }
    });

    var pad = document.getElementById('pad');

    pad.addEventListener('keydown',function(e) {
        if(e.keyCode === 9) {
            var start = this.selectionStart;
            var end = this.selectionEnd;

            var target = e.target;
            var value = target.value;
            target.value = value.substring(0, start)
                            + "    "
                            + value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
            e.preventDefault();
        }
    });

    sharejs.open(documentName, 'text', function(error, doc) {
        doc.attach_textarea(pad);
    });
};
