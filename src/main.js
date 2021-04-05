
// Our Javascript will go here.

// first we import everything from the three.s core into this script under the "THREE" namespace:
import * as THREE from '/js/three.module.js';

//import { OrbitControls } from '/js/OrbitControls.js';
import { OrbitControls } from '/js/OrbitControls.js';

const scene = new THREE.Scene();
// THREE.PerspectiveCamera(<FOV>, <aspect-ration>, <near-clipping-plane>, <far-clipping-plane> );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({antialias: true});


let controls = new OrbitControls( camera, renderer.domElement );
console.log("Camera controls disabled!")
// override with my pointer down event
controls.addEventListener('start', interceptOrbitalControlEvents, false);

renderer.setClearColor("#e5e5e5");
// To render app at lower resolution use setSize(w,h, false_here)
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

// resize properly
window.addEventListener('resize', () => {
    renderer.setSize( window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); 
})

// (0,0,0) is also the origin origin of the camera, which is bad so we move the camera away a bit
camera.position.z = 7;


// Now we add a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial({color: 0xFFCC00})
const cube = new THREE.Mesh( geometry, material );
scene.add( cube ); // be default adds to coordinate (0,0,0), 

// Light source
const light = new THREE.PointLight( 0xffffff, 1, 500 )
light.position.set(10,0, 25);
scene.add(light);



// Add rods
const cylinder_geometry = new THREE.CylinderGeometry(1,1,1,20); // 4th param for smooth cylinders
const rod_1 = new THREE.Mesh( cylinder_geometry, new THREE.MeshLambertMaterial( { color: 0x400000 } ));
const rod_2 = new THREE.Mesh( cylinder_geometry, new THREE.MeshLambertMaterial( { color: 0x007700 } ));
const rod_3 = new THREE.Mesh( cylinder_geometry, new THREE.MeshLambertMaterial( { color: 0x000077 } ));
const rod_1_bbox = new THREE.Mesh( cylinder_geometry, new THREE.MeshLambertMaterial( { color: 0x400000 } ));
const rod_2_bbox = new THREE.Mesh( cylinder_geometry, new THREE.MeshLambertMaterial( { color: 0x400000 } ));
const rod_3_bbox = new THREE.Mesh( cylinder_geometry, new THREE.MeshLambertMaterial( { color: 0x400000 } ));
rod_1.position.x = -3; rod_2.position.x = 3; rod_3.position.y = 3;
rod_1_bbox.position.x = -3; rod_2_bbox.position.x = 3; rod_3_bbox.position.y = 3;
rod_1_bbox.name = 'rod 1'; rod_2_bbox.name = 'rod 2'; rod_3_bbox.name = 'rod 3';
let rods = [rod_1, rod_2, rod_3];
let bboxes = [rod_1_bbox, rod_2_bbox, rod_3_bbox];
for (let i = 0; i < rods.length; i++) {
    rods[i].rotation.x += 1.52;
    rods[i].scale.set(0.2,3.4,0.2);
    rods[i].position.y -= 1;
    rods[i].position.z = 0.2;
    // set bounding boxes
    bboxes[i].rotation.x += 1.52;
    bboxes[i].position.y -= 1;
    bboxes[i].position.z = 0.2;
    bboxes[i].scale.set(2,3.5,2);
    bboxes[i].material.transparent = true;
    bboxes[i].material.opacity = 0.1;
    bboxes[i].stack = []; // Stack used by game logic for stacking Hanoi-disks
    scene.add(rods[i])
    scene.add(bboxes[i]);
}

// Add disk
let num_of_disks = 4;
let rainbow_colors = [0xff3366, 0xff6633, 0xffcc33, 0x33ff66, 0x33ffcc, 0x33ccff, 0x3366ff, 0x6633ff, 0xcc33ff, 0xefefef];
let num_colors = rainbow_colors.length;
for (let i = 0; i < num_of_disks; i++) {
    let disk = new THREE.Mesh( cylinder_geometry, new THREE.MeshLambertMaterial( { color: rainbow_colors[i % num_colors] }) );
    disk.position.set(rod_1.position.x, rod_1.position.y, 2*(i/num_of_disks))
    disk.rotation.set(Math.PI*0.5,1,0);
    disk.scale.set(2-(i*0.5),0.3,2-(i*0.5))
    disk.number = i;
    bboxes[0].stack.push(disk)
    scene.add( disk );
}




let raycaster, INTERSECTED; 

const mouse = new THREE.Vector2();
document.addEventListener( 'mousemove', onDocumentMouseMove );
document.addEventListener( 'mousedown', onDocumentMouseDown );
document.addEventListener( 'mouseup', onDocumentMouseUp );
function init() {
    raycaster = new THREE.Raycaster();
}

var render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}


// timelining/Tweening
// gsap.to(<target-object>,...)
// target option can be: selector text, variable, object or array
TweenMax.to(cube.rotation, 10, {x: Math.PI * 2, repeat: -1, ease: Linear.easyNone})
TweenMax.to(cube.rotation, 10, {y: Math.PI * 2, repeat: -1, ease: Linear.easyNone}) 
// But nothing is rendered yet, we need to create a rendering or animation loop:
function animate() {
    // update Text
    document.getElementById("infobox").innerHTML = "Mouse.x:" + mouse.x + "<br> Mouse.y:"+mouse.y + "<br>#:"+scene.children;
    
    // raycasting stuff...
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children); // get raycaster collisions
    if ( intersects.length > 0 ) {
        
        if ( INTERSECTED != intersects[ 0 ].object ) { // test if already intersected chosen

            if ( INTERSECTED ) {
                INTERSECTED.material.color.r = INTERSECTED.current_red;
            }
            
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.current_red = INTERSECTED.material.color.r;
            //INTERSECTED.material.color.r = INTERSECTED.material.color.r + 1;
            INTERSECTED.material.color.r = INTERSECTED.material.color.r + 1;
            // INTERSECTED.material.emissive.setHex( 0xff0000 );
        }

        document.getElementById("infobox").innerHTML= "COLLISION!";

    } else {
        if (INTERSECTED) {
            INTERSECTED.material.color.r = INTERSECTED.current_red;
        }
        INTERSECTED = null;
    }
    // request Animation Frame has a number of advantage and properties:
    // it pauses when the animation tab isn't in focus - you can see it drop from 40% cpu to 1% when you
    // switch to anther tab :)
    // and renders the screeen every time the screen is refreshed (so typically at 60 fps)
    requestAnimationFrame( animate );
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;
    renderer.render( scene, camera );
}
init();
animate();

let selected_rod;
function onDocumentMouseDown( event ) {
    event.preventDefault();
    if (INTERSECTED == cube) {
        console.log("cube clicked...")
        // hide easteregg 
        return
    }
    if (INTERSECTED == null) {
        console.log("nothing here!")
        controls.enabled = true;
        if (selected_rod) {
            selected_rod.material.opacity = 0.1; selected_rod = null;
        }
        return; 
    }
    // Player selected a move:
    if (selected_rod != INTERSECTED && selected_rod != null) {
        // Test if move is legal
        let source_stack_height = selected_rod.stack.length;
        let target_stack_height = INTERSECTED.stack.length;
        if (source_stack_height < 1) { // Is there any Disk to take from source?
            selected_rod.material.opacity = 0.1; selected_rod = null;
            console.log("no disks to take from rod")
            forbidden_move_action();
            return;
        }
        if(target_stack_height > 0) { // Target rod has any disk?
            let top_source_disk = selected_rod.stack[source_stack_height - 1]; // peek()-Operation is lacking in js
            let top_target_disk = INTERSECTED.stack[target_stack_height - 1]; 
            if (top_target_disk.number > top_source_disk.number) { // Top target disk is smaller
                console.log("Target's top disk is smaller! ")
                forbidden_move_action()
                return;
            }
        } 
        // All tests passed, move disk!
        console.log("Moving disk!")
        let x_pos = INTERSECTED.position.x;
        let y_pos = INTERSECTED.position.y;
        let z_pos = (INTERSECTED.stack.length * 0.5);
        console.log(`mouse.x: ${mouse.x} mouse.y: ${mouse.y}`);
        console.log(`stack height: ${INTERSECTED.stack.length} disk z-pos: ${z_pos}`);
        

        let disk = selected_rod.stack.pop();
        INTERSECTED.stack.push(disk);
        
        var tl = gsap.timeline();
        tl.to(disk.position, 0.2, {z: 2.0, ease: Linear.easyNone}); // move up
        tl.to(disk.position, 5.5, {x: x_pos, y: y_pos, ease: Linear.easyNone});
        tl.to(disk.position, 0.2, {z: z_pos, ease: Linear.easyNone});
        selected_rod.material.opacity = 0.1; selected_rod = null;
    } else {
        // get current intersected one with ray
        selected_rod = INTERSECTED;
        selected_rod.material.opacity = 0.8;
    }
    
}
function forbidden_move_action() {
    console.log("ILLEGAL MOVE YOU SCOUNDREL!");
}

function onDocumentMouseMove( event ) {
    event.preventDefault();

    let infostring = "selected: ";
    if (selected_rod) {infostring = infostring + selected_rod.name;}
    infostring = infostring + "<br>"+
    "rod 1: "+rod_1_bbox.stack + selected_rod+  "<br>"+  
    "rod 2: "+rod_2_bbox.stack + "<br>"+
    "rod 3: "+rod_3_bbox.stack + "<br>";
    
    document.getElementById("click").innerHTML= infostring;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onDocumentMouseUp( event ) {
    event.preventDefault();
    // all it ever does is disable camera control
    // in this way the camera only works when we click where there is no Intersected Object
    // (onDocumentMouseDown triggers this on INTERSECTED == Null)

}

function interceptOrbitalControlEvents ( event ) {
    console.log("interceptOrbitalControlEvents...")
    if (INTERSECTED) {
        controls.enabled = false;
    } else {
        controls.enabled = true;
    }
}
