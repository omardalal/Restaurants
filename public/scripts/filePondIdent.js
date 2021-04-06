FilePond.registerPlugin(FilePondPluginFileEncode);
FilePond.registerPlugin(FilePondPluginImagePreview);
FilePond.registerPlugin(FilePondPluginImageResize);
FilePond.registerPlugin(FilePondPluginFileValidateType);
FilePond.registerPlugin(FilePondPluginImageTransform);

var inputs = document.querySelectorAll('input[type="file"]');

if (document.getElementById("logoImg")!=undefined && document.getElementById("logoImg")!=null) {
    logoSrc = document.getElementById("logoImg").src
    if (logoSrc!=""&&logoSrc!=null&&logoSrc!=undefined) {
        FilePond.create(inputs[0], {
            acceptedFileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
            fileValidateTypeDetectType: (source, type) => new Promise((resolve, reject) => {
                resolve(type);
            }),
            Files: [{
                source: logoSrc
            }]
        });
    }
    var menuImgs = document.getElementsByClassName('menuDataImg');
    var imgs = [];
    for (var i=0; i<menuImgs.length; i++) {
        imgs[i] = {
            source: menuImgs[i].src
        }
    }
    FilePond.create(inputs[1], {
        acceptedFileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
        fileValidateTypeDetectType: (source, type) => new Promise((resolve, reject) => {
            resolve(type);
        }),
        Files: imgs
    });
} else {
    FilePond.create(inputs[0], {
        acceptedFileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
        fileValidateTypeDetectType: (source, type) => new Promise((resolve, reject) => {
            resolve(type);
        })
    });
    FilePond.create(inputs[1], {
        acceptedFileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
        fileValidateTypeDetectType: (source, type) => new Promise((resolve, reject) => {
            resolve(type);
        })
    });
}


