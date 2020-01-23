import * as toxicity from '@tensorflow-models/toxicity'
import './style.scss'
const threshold = 0.9
const CANNON = require('cannon')
const THREE = require('three')
import Tone from 'tone'
import './debug.js'
// Load the model. Users optionally pass in a threshold and an array of
// labels to include.

let arr = []
toxicity.load(threshold).then(model => {
  const button = document.getElementById('button')
  const input = document.getElementById('input')
  button.addEventListener('click', function (e) {
    console.log(e)
    analyse([input.value])
    input.value=''

  })




  const analyse = function(e){
    model.classify(e).then(predictions => {
    // `predictions` is an array of objects, one for each prediction head,
    // that contains the raw probabilities for each input along with the
    // final prediction in `match` (either `true` or `false`).
    // If neither prediction exceeds the threshold, `match` is `null`.

      console.log(predictions)
      arr = predictions.filter(x=> x.results[0].match=== true)

    /*
    prints:
    {
      "label": "identity_attack",
      "results": [{
        "probabilities": [0.9659664034843445, 0.03403361141681671],
        "match": false
      }]
    },
    {
      "label": "insult",
      "results": [{
        "probabilities": [0.08124706149101257, 0.9187529683113098],
        "match": true
      }]
    },
    ...
     */
    })
  }
})

const scene = new THREE.Scene()
const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 40, 25, 10 )
light.castShadow = true
scene.add(light)
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, (window.innerHeight /100)*75)
const screen = document.getElementById('three')
screen.appendChild( renderer.domElement )
//var controls = new OrbitControls( camera, renderer.domElement );
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 3000 )
camera.position.z = 30

let world, body, shape, timeStep=1/60,
   geometry, material, mesh, groundBody, floor, groundShape, platform,   platCanArr = [], platThreeArr = [],  score = 0, playerMaterial, playerContactMaterial, wallMaterial,   playing = true, version  = 0, totalScore = 0, start = false, ready= true
    world = new CANNON.World()
    world.gravity.set(0,-5,0)
    world.broadphase = new CANNON.NaiveBroadphase()
    world.solver.iterations = 10

    wallMaterial = new CANNON.Material('wallMaterial')
    playerMaterial = new CANNON.Material('playerMaterial')


    playerContactMaterial = new CANNON.ContactMaterial(playerMaterial,wallMaterial)
    playerContactMaterial.friction = 0
    playerContactMaterial.restitution = 0.5


    world.addContactMaterial(playerContactMaterial)
    shape = new CANNON.Box(new CANNON.Vec3(1,1,1))



    body = new CANNON.Body({
      mass: 1, material: playerMaterial
    })

    body.addShape(shape)
    body.angularVelocity.set(0,0,0)
    body.angularDamping = 0.5
    world.addBody(body)
    body.position.y = 10
    geometry = new THREE.BoxGeometry( 2, 2, 2 )
      material =  new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
        transparent: false } )


      //BOX

    mesh = new THREE.Mesh( geometry, material )
    scene.add(mesh)



      function createPlatform(x,y,z){
        groundShape = new CANNON.Box(new CANNON.Vec3(10,10,1))
        groundBody = new CANNON.Body({ mass: 0, material: wallMaterial })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
        groundBody.position.set(0,0,0)
        groundBody.position.x = x
        groundBody.position.y = y
        groundBody.position.z = z

        world.addBody(groundBody)
        platCanArr.push(groundBody)


        platform = new THREE.BoxGeometry( 20, 20, 2 )
        material =  new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
          transparent: false } )

        const platMesh = new THREE.Mesh( platform, material )

        platMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
        platMesh.position.x = x
        platMesh.position.y = y
        platMesh.position.z = z

        scene.add(platMesh)
        platThreeArr.push(platMesh)
      }


      createPlatform(0,0,0)

      for(let i=1;i<25;i ++ ){
        createPlatform(0,i*20,0)

      }
var update = function() {


  camera.position.x = mesh.position.x+ 0.20861329770365564
  camera.position.y = mesh.position.y + 9.488600711758697
  camera.position.z = mesh.position.z+ 52.37277465856009


  if(arr.length>0){
    console.log('works')
    body.velocity.y+=10
    arr = []
  }



updatePhysics()
  if(cannonDebugRenderer){
    cannonDebugRenderer.update()
  }
}
const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
function animate() {

  update()
  /* render scene and camera */
  mesh.position.copy(body.position)
  mesh.quaternion.copy(body.quaternion)
  renderer.render(scene,camera)
  requestAnimationFrame(animate)
}
function updatePhysics() {
  // Step the physics world
  world.step(timeStep)


}


requestAnimationFrame(animate)
