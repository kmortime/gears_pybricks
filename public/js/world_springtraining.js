var world_springtraining = new function() {
  var self = this;

  this.name = 'springtraining';
  this.shortDescription = 'FSS FLL Spring Training';
  this.longDescription =
    '<p>This world is automatically generated from the selected image.</p>' +
    '<p>You can use your own image or choose one of the provided images. The 3D world will be generated at a scale of 1px to 1mm.</p>';
  this.thumbnail = 'images/worlds/springtraining_mat.JPG';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(48, 0, -25), // Overridden by position setting,
    rotation: new BABYLON.Vector3(0, 0, 0)
  };

  this.optionsConfigurations = [
    {
      option: 'startPos',
      title: 'Starting Position',
      type: 'select',
      options: [
        ['Start Area Facing North', 'startNorth'],
        ['Start Area Facing West', 'startWest']
      ]
    },
    {
      option: 'startPosXY',
      title: 'Starting Position (x, y)',
      type: 'text',
      help: 'Enter using this format "x, y" (in cm, without quotes) and it will override the above. Center of image is "0, 0".'
    },
    {
      option: 'startRot',
      title: 'Starting Rotation (degrees)',
      type: 'text',
      help: 'Set the starting rotation in degrees. Positive rotation is clockwise.'
    }
  ];

  this.defaultOptions = {
    image: 'textures/maps/images/spring_training.jpg',
    imageURL: '',
    length: 100,
    width: 100,
    wall: true,
    wallHeight: 7.7,
    wallThickness: 4.5,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    obstacles: [],
    magnetics: [],
    startPos: 'center',
    startPosXY: '',
    startRot: ''
  };

  // Set options, including default
  this.setOptions = function(options) {
    let tmpOptions = {};
    Object.assign(tmpOptions, self.defaultOptions);
    Object.assign(tmpOptions, self.options);
    Object.assign(self.options, tmpOptions);

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }

    if (
      typeof options != 'undefined'
      && typeof options.imageURL != 'undefined'
      && options.imageURL.trim() != ''
    ) {
      self.options.image = options.imageURL;
    }

    if (
      typeof options != 'undefined'
      && typeof options.imageFile != 'undefined'
    ) {
      self.options.image = options.imageFile;
    }

    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        self.options.length = this.width / 10.0;
        self.options.width = this.height / 10.0;

        if (self.options.startPos == 'startWest') {
          let x = (self.options.length / 2 - 12.5);
          let z = -(self.options.width / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0.1, z);
        } else if (self.options.startPos == 'startNorth') {
          let x = (self.options.length / 2 - 12.5);
          let z = -(self.options.width / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0.1, z);
        }
        if (typeof self.options.startPosXY != 'undefined' && self.options.startPosXY.trim() != '') {
          let xy = self.options.startPosXY.split(',');
          self.robotStart.position = new BABYLON.Vector3(parseFloat(xy[0]), 0, parseFloat(xy[1]));
        }
        if (typeof self.options.startRot != 'undefined' && self.options.startRot.trim() != '') {
          self.robotStart.rotation.y = parseFloat(self.options.startRot) / 180 * Math.PI;
        } else {
          if (self.options.startPos== 'startWest') {
            self.robotStart.rotation.y = Math.PI/2.0*3;
          } else {
            self.robotStart.rotation.y = 0;
          }
        }

        resolve();
      }
      img.src = self.options.image;
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Create the scene
  this.load = function (scene) {
    var options = self.options;

    return new Promise(function(resolve, reject) {
      var groundMat = new BABYLON.StandardMaterial('ground', scene);
      var groundTexture = new BABYLON.Texture(options.image, scene);
      groundMat.diffuseTexture = groundTexture;
      groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      var faceUV = new Array(6);
      for (var i = 0; i < 6; i++) {
          faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
      }
      faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

      var boxOptions = {
          width: options.width,
          height: 10,
          depth: options.length,
          faceUV: faceUV
      };

      var ground = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
      ground.material = groundMat;
      ground.receiveShadows = true;
      ground.position.y = -5;
      ground.rotation.y = Math.PI / 2;

      if (options.wall) {
        var wallMat = new BABYLON.StandardMaterial('wallMat', scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        let wall1 = {
          height: options.wallHeight + 10,
          width: options.length + options.wallThickness * 2,
          depth: options.wallThickness
        }

        var wallTop = BABYLON.MeshBuilder.CreateBox('wallTop', wall1, scene);
        wallTop.position.y = wall1.height / 2 - 10;
        wallTop.position.z = (options.width + options.wallThickness) / 2;
        wallTop.material = wallMat;

        var wallBottom = BABYLON.MeshBuilder.CreateBox('wallBottom', wall1, scene);
        wallBottom.position.y = wall1.height / 2 - 10;
        wallBottom.position.z = -(options.width + options.wallThickness) / 2;
        wallBottom.material = wallMat;

        let wall2 = {
          height: options.wallHeight + 10,
          width: options.wallThickness,
          depth: options.width
        }

        var wallLeft = BABYLON.MeshBuilder.CreateBox('wallLeft', wall2, scene);
        wallLeft.position.y = wall1.height / 2 - 10;
        wallLeft.position.x = -(options.length + options.wallThickness) / 2;
        wallLeft.material = wallMat;

        var wallRight = BABYLON.MeshBuilder.CreateBox('wallRight', wall2, scene);
        wallRight.position.y = wall1.height / 2 - 10;
        wallRight.position.x = (options.length + options.wallThickness) / 2;
        wallRight.material = wallMat;
      }

      // Physics
      ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: 0,
          friction: options.groundFriction,
          restitution: options.groundRestitution
        },
        scene
      );

      if (options.wall) {
        var wallOptions = {
          mass: 0,
          friction: options.wallFriction,
          restitution: options.wallRestitution
        };
        wallTop.physicsImpostor = new BABYLON.PhysicsImpostor(
          wallTop,
          BABYLON.PhysicsImpostor.BoxImpostor,
          wallOptions,
          scene
        );
        wallBottom.physicsImpostor = new BABYLON.PhysicsImpostor(
          wallBottom,
          BABYLON.PhysicsImpostor.BoxImpostor,
          wallOptions,
          scene
        );
        wallLeft.physicsImpostor = new BABYLON.PhysicsImpostor(
          wallLeft,
          BABYLON.PhysicsImpostor.BoxImpostor,
          wallOptions,
          scene
        );
        wallRight.physicsImpostor = new BABYLON.PhysicsImpostor(
          wallRight,
          BABYLON.PhysicsImpostor.BoxImpostor,
          wallOptions,
          scene
        );
      }

      // obstacles
      if (self.options.obstacles.length > 0) {
        self.addObstacles(scene, self.options.obstacles);
      }

      // magnetic objects
      if (self.options.magnetics.length > 0) {
        self.addMagnetics(scene, self.options.magnetics);
      }

      // Add FSS FLL Base Objects:
      self.loadObjects(scene);

      resolve();
    });
  };

  // Add obstacles
  this.addObstacles = function(scene, obstacles) {
    let obstacleMat = new BABYLON.StandardMaterial('obstacle', scene);
    obstacleMat.diffuseColor = new BABYLON.Color3(0.9, 0.5, 0.5);
    obstacleMat.alpha = 0.5;

    let obstacleMeshes = [];
    for (let i=0; i<obstacles.length; i++) {
      let pos = obstacles[i][0];
      let size = [10, 10, 10];
      if (obstacles[i][1]) {
        size = obstacles[i][1];
      }
      let rot = [0, 0, 0];
      if (obstacles[i][2]) {
        rot = obstacles[i][2];
      }

      let obstacle = self.addBox(scene, obstacleMat, size, pos, false, true, true, rot);
      obstacleMeshes.push(obstacle);
    }
    return obstacleMeshes;
  };
  // Add Objects
  this.loadObjects = function (scene) {

  // Bumps
    self.buildStatic(scene,[1,24,3],[27,0.5,17]);

  // Boxes for pushing
    self.buildKinematic(scene,[4,4,4],[49,2,10],800);
    self.buildKinematic(scene,[4,4,4],[-48,2,20],800);
 //   self.buildKinematic(scene,[4,4,4],[55,2,-22],800);
  };

  // Add magnetic
  this.addMagnetics = function(scene, magnetics) {
    let magneticMat = new BABYLON.StandardMaterial('magnetic', scene);
    magneticMat.diffuseColor = new BABYLON.Color3(0.1, 0.9, 0.1);

    let physicsOptions = {
      mass: 10,
      friction: 0.5
    };

    let magneticMeshes = [];
    for (let i=0; i<magnetics.length; i++) {
      let pos = magnetics[i][0];
      let size = [5, 5, 0.5];
      if (magnetics[i][1]) {
        size = magnetics[i][1];
      }
      let rot = [0, 0, 0];
      if (magnetics[i][2]) {
        rot = magnetics[i][2];
      }

      let magnetic = self.addBox(scene, magneticMat, size, pos, true, physicsOptions, true, rot);
      magneticMeshes.push(magnetic);
    }
    return magneticMeshes;
  };

 // static object builder
  this.buildStatic = function(scene, dim, pos, rot=[0,0,0], friction=self.options.staticObjectFriction, restitution=self.options.staticObjectRestitution) {
    var ramp = BABYLON.MeshBuilder.CreateBox('ramp', {height: dim[0], width: dim[1], depth: dim[2]}, scene);
    ramp.position.x = pos[0];
    ramp.position.y = pos[1];
    ramp.position.z = pos[2];
    ramp.rotation.x = rot[0];
    ramp.rotation.y = rot[1];
    ramp.rotation.z = rot[2];
    ramp.material = self.staticMat;

    ramp.physicsImpostor = new BABYLON.PhysicsImpostor(
      ramp,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        friction: friction,
        restitution: restitution
      },
      scene
    );
  };

  // kinematic object builder
  this.buildKinematic = function(scene, dim, pos, mass=400, rot=[0,0,0], friction=0.5, restitution=self.options.kinematicObjectRestitution) {
    var block = BABYLON.MeshBuilder.CreateBox('block', {height: dim[0], width: dim[1], depth: dim[2]}, scene);
    block.position.x = pos[0];
    block.position.y = pos[1];
    block.position.z = pos[2];
    block.rotation.x = rot[0];
    block.rotation.y = rot[1];
    block.rotation.z = rot[2];
    block.material = self.kinematicMat;

    block.physicsImpostor = new BABYLON.PhysicsImpostor(
      block,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: mass,
        friction: friction,
        restitution: restitution
      },
      scene
    );
  }
  // Add box
  this.addBox = function(scene, material, size, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null) {
    var boxOptions = {
      width: size[0],
      depth: size[1],
      height: size[2],
    };
    if (pos.length < 3) {
      pos.push(0);
    }
    if (faceUV) {
      boxOptions.faceUV = faceUV;
    }

    var box = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    if (visible) {
      box.material = material;
    } else {
      box.visibility = 0;
    }
    box.position.x = pos[0];
    box.position.y = pos[2] + size[2] / 2;
    box.position.z = pos[1];
    box.rotation.x = rot[0];
    box.rotation.y = rot[1];
    box.rotation.z = rot[2];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      box.isMagnetic = true;
    }

    if (physicsOptions !== false) {
      if (physicsOptions === true) {
        physicsOptions = {
          mass: mass,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
        };
      }

      box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box,
        BABYLON.PhysicsImpostor.BoxImpostor,
        physicsOptions,
        scene
      );
      if (magnetic) {
        box.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
      }
    }

    return box;
  };
}

// Init class
world_springtraining.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_springtraining);
