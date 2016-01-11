
var stats;
var container;
var camera, scene, renderer;

var please_quit = false;

var loader = new THREE.TextureLoader();
var axial = Array.apply(null, Array(181));
var coronal = Array.apply(null, Array(181));
var sagittal = Array.apply(null, Array(217));

var work = axial.length + coronal.length + sagittal.length
var loaded = false;
function ready() {
    combined = axial.concat(coronal).concat(sagittal);
    not_yet_found = combined.filter(function(x) {return x === undefined;});
    console.log(work - not_yet_found.length + " out of " + work + " loaded");
    if (loaded && not_yet_found.length == 0) {
        clearInterval(loadforcer);
        init();
    }
};

function load_texture(name, i, list) {
    var index = ("000" + (i + 1)).slice(-3)
    loader.load("brain/"+name+"_stack/slice_" + index + ".png",
                function(texture) {
                    list[i] = {texture:texture};
                    ready();
                },
                function(xhr) {console.log(".");},
                         function(xhr) {console.log("Error loading "+name+" "+i)});

};

function load() {
    var y = [["axial", 181, axial],
             ["coronal", 181, coronal],
             ["sagittal", 217, sagittal]].map(function(tuple) {
                 var name = tuple[0];
                 var images = tuple[1];
                 var list = tuple[2];
                 for (var i = 0; i < images; i++) {
                     if (list[i] === undefined) {
                         load_texture(name, i, list);
                     }
                 }
             });
};
load();
var loadforcer = setInterval(load, 10000);

function init() {
    console.log("initing");

    container = document.getElementById("container");
    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setClearColor(0xcccccc);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 150;

    onWindowResize()

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    // controls.enableZoom = true;
    // controls.target.set(-30, 30, 10);
    controls.object.position.set(120, 80, 300);
    controls.update();

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);


    // var axes = new THREE.AxisHelper(20);
    // scene.add(axes);

    var i = 0;
    var step = 1;

    var axial_geometry = new THREE.PlaneGeometry(181, 217);
    for (var i = 0; i < axial.length; i+=step) {
        var material = new THREE.MeshBasicMaterial({color: 0xf1c7ee, side:THREE.DoubleSide, map:axial[i].texture, transparent:true, alphaMap:axial[i].texture});
        var plane = new THREE.Mesh(axial_geometry, material);
        axial[i].material = material;
        axial[i].plane = plane;
        scene.add(plane);
        plane.rotateX(Math.PI/2);
        plane.position.setY(-axial.length/2 + i);
    }
    var coronal_geometry = new THREE.PlaneGeometry(217, 181);
    for (var i = 0; i < coronal.length; i+=step) {
        var material = new THREE.MeshBasicMaterial({color: 0xf1c7ee, side:THREE.DoubleSide, map:coronal[i].texture, transparent:true, alphaMap:coronal[i].texture});
        var plane = new THREE.Mesh(coronal_geometry, material);
        coronal[i].material = material;
        coronal[i].plane = plane;
        scene.add(plane);
        plane.rotateY(Math.PI/2);
        plane.position.setX(-coronal.length/2 + i);
    }
    var sagittal_geometry = new THREE.PlaneGeometry(181, 181);
    for (var i = 0; i < sagittal.length; i+=step) {
        var material = new THREE.MeshBasicMaterial({color: 0xf1c7ee, side:THREE.DoubleSide, map:sagittal[i].texture, transparent:true, alphaMap:sagittal[i].texture});
        var plane = new THREE.Mesh(sagittal_geometry, material);
        sagittal[i].material = material;
        sagittal[i].plane = plane;
        scene.add(plane);
        plane.position.setZ(sagittal.length/2 - i);
    }

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );

    function onWindowResize() {
        var width = window.innerWidth - 20;
        var height = window.innerHeight - 80;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener("resize", onWindowResize, false);

    function render() {
        if (please_quit) {
            return;
        }

        window.requestAnimationFrame(render);
        controls.update()
        stats.update();
        renderer.render(scene, camera);
    }

    visible = {};

    function create_slider(name, list) {
        $("#"+name+"_slider").slider({
            min: 1,
            max: list.length,
            slide: function(event, ui) {
                if (visible[name]) {
                    visible[name].plane.visible = false;
                } else {
                    list.map(function(x) {
                        x.plane.visible = false;
                        x.material.transparent = false;
                    });
                }
                visible[name] = list[ui.value - 1];
                visible[name].plane.visible = true;
            }});
    };
    create_slider("axial", axial);
    create_slider("coronal", coronal);
    create_slider("sagittal", sagittal);

    $("#loading").remove();
    console.log("init done");
    render();
}

function quit() {
    please_quit = true;
}

function wtf() {
    for (var i = 0; i < axial.length; i++) {
        if (axial[i] == undefined) {
            console.log("axial", i);
        }
    }
    for (var i = 0; i < coronal.length; i++) {
        if (coronal[i] == undefined) {
            console.log("coronal", i);
        }
    }
    for (var i = 0; i < sagittal.length; i++) {
        if (sagittal[i] == undefined) {
            console.log("sagittal", i);
        }
    }
    }
window.onload = function() {loaded = true; ready();};
