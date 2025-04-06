import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Configuração da cena, câmera e renderer
class FlowerScene {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Configuração básica
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000, 0); // Fundo totalmente transparente

        // Adiciona o canvas ao container
        const container = document.getElementById('scene-container');
        container.appendChild(this.renderer.domElement);

        // Configuração inicial da câmera
        this.camera.position.set(10, 8, 10);
        this.camera.lookAt(0, 0, 0);

        // Controles de órbita
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI / 1.5;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.enablePan = false;
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // Iluminação
        this.setupLights();

        // Carrega o modelo
        this.loadModel();

        // Carrega a fonte e cria o texto
        this.loadFont();

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Inicia o loop de renderização
        this.animate();

        // Configura o vídeo e áudio
        this.setupVideoAndAudio();
    }

    setupLights() {
        // Luz ambiente suave
        const ambientLight = new THREE.AmbientLight(0xfff0f0, 0.6); // Tom levemente rosado
        this.scene.add(ambientLight);

        // Luz direcional principal (luz do sol)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 500;
        mainLight.shadow.bias = -0.0001;
        this.scene.add(mainLight);

        // Luz de preenchimento frontal suave
        const fillLight = new THREE.DirectionalLight(0xff9999, 0.4); // Tom rosado suave
        fillLight.position.set(0, 0, 5);
        this.scene.add(fillLight);

        // Luz de realce para brilho nas pétalas
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(-5, 5, -5);
        this.scene.add(rimLight);
    }

    loadModel() {
        // Configuração do Draco loader para descompressão
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

        // Configuração do GLTF loader
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        // Mostra o indicador de carregamento
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }

        // Carrega o modelo
        loader.load(
            'source/rose-bouquet-red.glb',
            (gltf) => {
                console.log('Modelo carregado com sucesso');
                const model = gltf.scene;
                
                // Aplica materiais e sombras ao modelo
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        if (child.material) {
                            child.material.envMapIntensity = 1.5;
                            child.material.roughness = 0.6;
                            child.material.metalness = 0.2;
                            child.material.needsUpdate = true;
                        }
                    }
                });

                // Cria um grupo para o modelo
                const modelGroup = new THREE.Group();
                
                // Calcula o tamanho do modelo
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                // Reseta a posição do modelo para o centro
                model.position.x = -center.x;
                model.position.y = -center.y;
                model.position.z = -center.z;

                // Adiciona o modelo ao grupo
                modelGroup.add(model);

                // Ajusta a escala baseada no tamanho do modelo
                const scale = 5 / Math.max(size.x, size.y, size.z);
                modelGroup.scale.setScalar(scale);

                // Posiciona o grupo no centro da cena
                modelGroup.position.set(0, 0, 0);
                
                this.scene.add(modelGroup);
                this.model = modelGroup;

                // Configura a câmera e controles
                const distance = 10;
                this.camera.position.set(distance, distance * 0.8, distance);
                this.camera.lookAt(0, 0, 0);
                
                this.controls.target.set(0, 0, 0);
                this.controls.minDistance = distance * 0.5;
                this.controls.maxDistance = distance * 2;
                this.controls.update();

                // Inicia a rotação automática
                this.autoRotate = true;

                // Esconde o indicador de carregamento
                this.hideLoading();
            },
            (xhr) => {
                const progress = (xhr.loaded / xhr.total) * 100;
                console.log(`${Math.round(progress)}% carregado`);
                
                const loadingText = document.querySelector('.loading-text');
                if (loadingText) {
                    loadingText.textContent = `Carregando... ${Math.round(progress)}%`;
                }
            },
            (error) => {
                console.error('Erro ao carregar o modelo:', error);
                this.hideLoading();
                
                const loadingText = document.querySelector('.loading-text');
                if (loadingText) {
                    loadingText.textContent = 'Erro ao carregar o modelo. Por favor, recarregue a página.';
                    loadingText.style.color = 'red';
                }
            }
        );
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
            console.log('Indicador de carregamento ocultado');
        } else {
            console.warn('Elemento de carregamento não encontrado');
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotação suave do modelo
        if (this.model && this.autoRotate) {
            this.model.rotation.y += 0.001; // Velocidade de rotação muito suave
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    loadFont() {
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            // Cria o coração 3D
            const heartShape = new THREE.Shape();
            const x = 0, y = 0;
            heartShape.moveTo(x + 0.25, y + 0.25);
            heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
            heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
            heartShape.bezierCurveTo(x - 0.3, y + 0.6, x - 0.15, y + 0.8, x + 0.25, y + 1);
            heartShape.bezierCurveTo(x + 0.65, y + 0.8, x + 0.8, y + 0.6, x + 0.8, y + 0.35);
            heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
            heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

            const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
                depth: 0.2,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelSegments: 5
            });

            // Cria o texto "Nicole"
            const textGeometry1 = new TextGeometry('Nicole', {
                font: font,
                size: 0.8,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });

            // Cria o texto "Samila"
            const textGeometry2 = new TextGeometry('Samila', {
                font: font,
                size: 0.8,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });

            // Material vermelho brilhante para o coração
            const heartMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xff0000, // Vermelho puro
                metalness: 0.3,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                emissive: 0xff0000,
                emissiveIntensity: 0.5,
                side: THREE.DoubleSide
            });

            // Material dourado para o texto principal
            const textMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffd700,
                metalness: 0.8,
                roughness: 0.2,
                clearcoat: 0.8,
                clearcoatRoughness: 0.2
            });

            // Cria as meshes
            const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
            const textMesh1 = new THREE.Mesh(textGeometry1, textMaterial);
            const textMesh2 = new THREE.Mesh(textGeometry2, textMaterial);

            // Centraliza os textos
            textGeometry1.computeBoundingBox();
            textGeometry2.computeBoundingBox();
            
            const textWidth1 = (textGeometry1.boundingBox.max.x - textGeometry1.boundingBox.min.x);
            const textWidth2 = (textGeometry2.boundingBox.max.x - textGeometry2.boundingBox.min.x);

            // Posiciona e ajusta o coração
            heartMesh.scale.set(0.5, 0.5, 0.5);
            heartMesh.position.set(0, 5, 0); // Aumentei a altura do coração
            heartMesh.rotation.z = Math.PI;

            textMesh1.position.x = -textWidth1 / 2;
            textMesh1.position.y = 4; // Aumentei a altura do "Nicole"
            textMesh1.position.z = 0;

            textMesh2.position.x = -textWidth2 / 2;
            textMesh2.position.y = 3; // Aumentei a altura do "Samila"
            textMesh2.position.z = 0;

            // Cria um grupo para animar o coração
            const heartGroup = new THREE.Group();
            heartGroup.add(heartMesh);
            
            // Adiciona animação suave de flutuação e rotação do coração
            const animate = () => {
                const time = Date.now() * 0.001;
                heartGroup.position.y = Math.sin(time * 1.5) * 0.15; // Aumentei um pouco a amplitude da flutuação
                heartMesh.rotation.y = Math.sin(time * 2) * 0.3;
                requestAnimationFrame(animate);
            };
            animate();

            // Adiciona os elementos à cena
            this.scene.add(heartGroup);
            this.scene.add(textMesh1);
            this.scene.add(textMesh2);
        });
    }

    setupVideoAndAudio() {
        // Cria um elemento de vídeo
        const video = document.createElement('video');
        video.src = 'tiktokvideo.mp4';
        video.loop = true;
        video.muted = false; // Começa mutado para permitir autoplay
        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        
        // Cria uma textura de vídeo
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat; // Mudado para RGBA
        videoTexture.colorSpace = THREE.SRGBColorSpace;

        // Cria um material com a textura do vídeo
        const videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });

        // Cria um plano para o vídeo com proporção 16:9
        const aspectRatio = 16 / 9;
        const videoWidth = 12;
        const videoHeight = videoWidth / aspectRatio;
        const planeGeometry = new THREE.PlaneGeometry(videoWidth, videoHeight);
        const videoPlane = new THREE.Mesh(planeGeometry, videoMaterial);
        
        // Posiciona o plano em uma posição mais visível
        videoPlane.position.z = -8;
        videoPlane.position.y = 5;
        videoPlane.position.x = 0;
        videoPlane.rotation.x = -Math.PI * 0.05;
        
        this.scene.add(videoPlane);
        this.videoPlane = videoPlane;

        // Configura o botão de play/pause
        const playPauseBtn = document.getElementById('play-pause');
        if (playPauseBtn) {
            playPauseBtn.style.display = 'block';
            playPauseBtn.addEventListener('click', () => {
                if (video.paused) {
                    video.muted = false; // Desmuta o vídeo quando o usuário clicar
                    video.play();
                    playPauseBtn.classList.add('playing');
                } else {
                    video.pause();
                    playPauseBtn.classList.remove('playing');
                }
            });
        }

        // Adiciona evento para garantir que o vídeo está carregado
        video.addEventListener('loadedmetadata', () => {
            console.log('Vídeo carregado:', video.videoWidth, 'x', video.videoHeight);
            // Tenta iniciar o vídeo mudo
            video.play().then(() => {
                console.log('Vídeo iniciado com sucesso (mudo)');
            }).catch(error => {
                console.log("Erro ao iniciar o vídeo:", error);
            });
        });

        // Adiciona evento para debug
        video.addEventListener('error', (e) => {
            console.error('Erro no vídeo:', e);
        });

        this.videoElement = video;
    }
}

// Gerenciador de letras e áudio
class LyricsManager {
    constructor() {
        this.lyrics = [
            "Baby, baby, baby oh",
            "Like baby, baby, baby no",
            "Like baby, baby, baby oh",
            "I thought you'd always be mine"
        ]; // PLACEHOLDER: Substitua pelas letras reais
        this.currentIndex = 0;
        this.container = document.getElementById('lyrics-container');
        this.setupAudio();
        this.setupLyrics();
    }

    setupAudio() {
        // Temporariamente desativado para evitar erro 404
        this.playPauseBtn = document.getElementById('play-pause');
        if (this.playPauseBtn) {
            this.playPauseBtn.style.display = 'none';
        }
    }

    setupLyrics() {
        this.lyrics.forEach(line => {
            const div = document.createElement('div');
            div.className = 'lyrics-line';
            div.textContent = line;
            this.container.appendChild(div);
        });
    }

    startLyricsAnimation() {
        this.currentIndex = 0;
        this.showNextLyric();
    }

    stopLyricsAnimation() {
        const lines = document.querySelectorAll('.lyrics-line');
        lines.forEach(line => line.classList.remove('visible'));
    }

    showNextLyric() {
        if (this.currentIndex > 0) {
            const prevLine = document.querySelectorAll('.lyrics-line')[this.currentIndex - 1];
            prevLine.classList.remove('visible');
        }

        if (this.currentIndex < this.lyrics.length) {
            const currentLine = document.querySelectorAll('.lyrics-line')[this.currentIndex];
            currentLine.classList.add('visible');
            this.currentIndex++;
            setTimeout(() => this.showNextLyric(), 4000); // Ajuste o tempo conforme necessário
        } else {
            this.currentIndex = 0;
            setTimeout(() => this.showNextLyric(), 2000);
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const scene = new FlowerScene();
    const lyricsManager = new LyricsManager();
}); 