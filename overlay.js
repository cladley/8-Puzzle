

function Overlay(config) {
  
    var container = document.getElementsByClassName('cl-overlay')[0];
    if (!container) {
        throw new Error("Need a container for the overlay");
    }
   
    var parent = container.parentNode;
    var width = parent.offsetWidth;
    var height = parent.offsetHeight;

    this.img = new Image();
    this.visible = false;
    this.holder = $('<div>', {
        css: {
            display: 'none'
        }
    });

    this.div = $('<div>', {
        id: 'cover',
        css: {
            background: 'black',
            opacity: 0.6,
            position: 'absolute',
            'box-shadow': "5px 5px 5px #111",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }
    });
    $(container).css({
        position: 'absolute',
        'box-shadow': "5px 5px 5px #111",
        top:10
    });
    this.holder.append(this.img);
    this.holder.append(this.div);
    $(container).append(this.holder);
}

Overlay.prototype.show = function (animate) {
    if (animate) {
        var args = Array.prototype.slice.call(arguments, 1);
        var speed;
        if (args.length > 0)
            speed = args[0];

        speed = speed || 300;
        this.holder.fadeIn(speed);
    } else {
        this.holder.css('display', 'block');
    }
    this.visible = true;
};

Overlay.prototype.load_img = function (img) {
    try{
        this.url = img;
        this.img.src = img;
    } catch (e) {
        throw new Error("Error loading the image");
    }
    
}

Overlay.prototype.get_image_url = function () {
    return this.url;
}

Overlay.prototype.hide = function (animate) {
    if (animate)
        this.holder.fadeOut();
    else
        this.holder.css('display', 'none');
    this.visible = false;
};

Overlay.prototype.isVisible = function () {
    return this.visible;
}