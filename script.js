let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let pins = [];

init();
animate();

function init() {
    // 1. สร้าง Scene และ Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // 2. สร้าง Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 3. ควบคุมมุมมองด้วยเมาส์ (OrbitControls)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 4. แสงสว่าง
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // 5. โหลดภาพ PNG แผนภาพ (จำลองเป็นระนาบ Plane 3D)
    // ถ้านำภาพมาวาง ให้เปลี่ยนชื่อไฟล์ 'map-image.png' ให้ตรงกับไฟล์จริงของคุณ
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('map-image.png', (texture) => {
        const planeGeo = new THREE.PlaneGeometry(10, 10);
        const planeMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2; // นอนราบไปกับพื้น
        scene.add(plane);
        
        // โหลดข้อมูลหมุดหลังจากแผนภาพโหลดเสร็จ
        loadPins();
    }, undefined, (err) => {
        console.log('ยังไม่พบไฟล์ภาพแผนภาพ ใช้พื้นหลังสีเทาแทนไปก่อน');
        loadPins();
    });

    // Event ฟังชั่นคลิก
    window.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onWindowResize);
    document.getElementById('close-btn').addEventListener('click', hideInfo);
}

function loadPins() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                // สร้างหมุด (ทรงกลมสีแดงแทนหมุด)
                const geometry = new THREE.SphereGeometry(0.3, 32, 32);
                const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const pin = new THREE.Mesh(geometry, material);
                
                pin.position.set(item.position.x, item.position.y + 0.3, item.position.z);
                pin.userData = item; // เก็บข้อมูลไว้ที่ตัววัตถุ
                
                scene.add(pin);
                pins.push(pin);
            });
        });
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pins);

    if (intersects.length > 0) {
        const selectedPin = intersects[0].object;
        showInfo(selectedPin.userData);
    }
}

function showInfo(data) {
    document.getElementById('info-title').innerText = data.name;
    document.getElementById('info-desc').innerText = data.description;
    document.getElementById('info-panel').classList.remove('hidden');
}

function hideInfo() {
    document.getElementById('info-panel').classList.add('hidden');
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
