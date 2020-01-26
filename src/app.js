import * as toxicity from '@tensorflow-models/toxicity'
import './style.scss'
const threshold = 0.9
const CANNON = require('cannon')
const THREE = require('three')
import Tone from 'tone'
import './debug.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


var freeverb = new Tone.Freeverb().toMaster()
freeverb.dampening.value = 25
freeverb.roomSize.value = 0.7
var pingPong = new Tone.PingPongDelay('4n', 0.2).toMaster()
var autoWah = new Tone.AutoWah(50, 6, -30).toMaster()
var synthA = new Tone.DuoSynth().chain(freeverb, pingPong, autoWah).toMaster()
const notes = ['E4','F4','G4','A4','D4','E3','F3','G3','A3','D3']

const scoreDiv= document.getElementById('score')
const over = document.getElementById('over')
let arr = []
let insults = []
const form = document.getElementById('form')
form.addEventListener('submit', function (e) {
  e.preventDefault()
})
toxicity.load(threshold).then(model => {
  ready = true
  const input = document.getElementById('input')
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    console.log(e)

    if(!insults.includes(input.value)){
      analyse([input.value])
    }
    if(insults.includes(input.value)){
      body.velocity.x+=5
    }

    insults.push(input.value)
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
scene.background = new THREE.Color(0xffffff)

const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 40, 25, 10 )
light.castShadow = true
scene.add(light)
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, (window.innerHeight /100)*75)
const screen = document.getElementById('three')
screen.appendChild( renderer.domElement )

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 3000 )
camera.position.z = 30
//var controls = new OrbitControls( camera, renderer.domElement );
let world, body, shape, timeStep=1/60,
   geometry, material, material2, material3, material4, material5, material6, mesh, groundBody, floor, groundShape, platform,   platCanArr = [], platThreeArr = [],  playerMaterial, playerContactMaterial, wallMaterial,   playing = true, ready= false




world = new CANNON.World()
world.gravity.set(0,-5,0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10

wallMaterial = new CANNON.Material('wallMaterial')
playerMaterial = new CANNON.Material('playerMaterial')


playerContactMaterial = new CANNON.ContactMaterial(playerMaterial,wallMaterial)
playerContactMaterial.friction = 0.3
playerContactMaterial.restitution = 0.5


world.addContactMaterial(playerContactMaterial)
shape = new CANNON.Box(new CANNON.Vec3(1,1,1))

function randomMat(){
  return new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
    transparent: true } )
}

body = new CANNON.Body({
  mass: 1, material: playerMaterial
})

body.addShape(shape)
body.angularVelocity.set(0,0,0)
body.angularDamping = 0.5
world.addBody(body)
body.position.y = 10
body.addEventListener('collide',function(e){

  synthA.triggerAttackRelease(notes[Math.floor(Math.random()*9)],1)
  mesh.material = [randomMat(),randomMat(),randomMat(),randomMat(),randomMat(),randomMat()]

})


geometry = new THREE.BoxGeometry( 2, 2, 2 )
mesh = new THREE.Mesh( geometry, [randomMat(),randomMat(),randomMat(),randomMat(),randomMat(),randomMat()] )
scene.add(mesh)



function createPlatform(x,y,z){



  platform = new THREE.BoxGeometry( 20, 20, 2 )


  const platMesh = new THREE.Mesh( platform, [randomMat(),randomMat(),randomMat(),randomMat(),randomMat(),randomMat()])

  platMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
  platMesh.position.x = x
  platMesh.position.y = y
  platMesh.position.z = z

  scene.add(platMesh)
  platThreeArr.push(platMesh)
}
function createCanPlat(x,y,z){
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

}

createPlatform(0,0,0)
createCanPlat(0,0,0)

for(let i=1;i<50;i ++ ){
  createPlatform(0,i*20,0)

}
var update = function() {


  camera.position.x = mesh.position.x+ 0.20861329770365564
  camera.position.y = mesh.position.y + 9.488600711758697
  camera.position.z = mesh.position.z+ 52.37277465856009


  if(arr.length>0){
    console.log('works')
    body.velocity.y+=20
    arr = []
  }



  updatePhysics()
  if(cannonDebugRenderer){
    //cannonDebugRenderer.update()
  }
}
document.onkeydown = checkKey



function checkKey(e) {

  e = e || window.event



  if (e.keyCode === 82 &&!playing) {
    playing = true


    platCanArr.map(x=>{

      world.remove(x)

    } )

    platCanArr = []
    createCanPlat(0,0,0)
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
    body.velocity.y = 0
    body.velocity.x = 0
    body.angularVelocity.z = 0
    body.angularVelocity.y = 0
    body.angularVelocity.x = 0
    body.velocity.z = 0
    body.position.y = 10
    body.position.x = 0
    body.position.z = 0


    over.innerHTML = ''
    insults = []

  }
}


const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
function animate() {
  if(ready){
    scoreDiv.innerText = 'SCORE: ' +`${platCanArr.length-1}`
  }
  if(!ready){
    scoreDiv.innerHTML = 'LOADING ... upset the computer to jump, try not to repeat yourself'
  }

  update()
  /* render scene and camera */
  mesh.position.copy(body.position)
  mesh.quaternion.copy(body.quaternion)
  renderer.render(scene,camera)
  requestAnimationFrame(animate)
  for(let i=platCanArr.length;i<platThreeArr.length;i++){
    if(mesh.position.y-4>platThreeArr[i].position.y){
      console.log(platThreeArr[i].position.y)
      createCanPlat(0,platThreeArr[i].position.y,0)
    }

    if(mesh.position.y+4<platThreeArr[0].position.y){
      playing = false
      over.innerHTML = 'GAME OVER. R to Resest'
    }





  }
}



function updatePhysics() {
  // Step the physics world
  world.step(timeStep)


}


requestAnimationFrame(animate)
