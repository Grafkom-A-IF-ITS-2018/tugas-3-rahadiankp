/* BOX START*/

const BOX_GEOMETRY_FACE = 6;
const BOX_GEOMETRY_POINT = 4;

function BoxGeometry(depth, width, height, step = 1, colored = false){
    Geometry.call(this);

    this.type = 'geometry';
    this.indices = [];
    this.vertices = [];
    this.vertices_ = [];
    this.normals = [];
    this.colors = [];
    this.textureCoord = [];
    this.textureSrc = undefined;
    this.position = [];

    this.step = step;

    var d = depth / 2;
    var w = width / 2;
    var h = height / 2;

    var counter = 0;
    for(let i = 0; i < BOX_GEOMETRY_FACE; i+=step, counter++){
        for(let j = 0; j < BOX_GEOMETRY_POINT; j++){
            var x = d, y = w, z = h;
            if(i & 4){ // LEFT RIGHT
                x *= (i&1)? -1 : 1;
                y *= (j&2)? 1 : -1;
                z *= (j&1)? 1 : -1;
                this.normals.push(1.0, 0, 0);
            } else if ( i & 2) { // BOTTOM TOP
                x *= (j&2)? 1 : -1;
                y *= (i&1)? -1 : 1;
                z *= (j&1)? 1 : -1;
                this.normals.push(0, 1.0, 0);
            } else { // FRONT BACK
                x *= (j&2)? 1 : -1;
                y *= (j&1)? 1 : -1;
                z *= (i&1)? -1 : 1;
                this.normals.push(0, 0, 1.0);
            }
            this.vertices.push(x, y, z);
            if(colored) this.colors.push(1.0, 1.0, 1.0, 1.0);
            else this.colors.push(0.0, 0.0, 0.0, 1.0);
        }
        var p = counter * BOX_GEOMETRY_POINT;
        var q = counter * BOX_GEOMETRY_POINT + 1;
        var r = counter * BOX_GEOMETRY_POINT + 2;
        var s = counter * BOX_GEOMETRY_POINT + 3;
        this.indices.push(p, q, r);
        this.indices.push(q, r, s);
    }

    for(let i = 0; i < BOX_GEOMETRY_FACE / 3; i++, counter++){
        for(let j = 0; j < BOX_GEOMETRY_POINT; j++){
            var x = d, y = w, z = h;
            if ( i & 2) { // BOTTOM TOP
                x *= (j&2)? 1 : -1;
                y *= (i&1)? -1 : 1;
                z *= (j&1)? 1 : -1;
            } else { // FRONT BACK
                x *= (j&2)? 1 : -1;
                y *= (j&1)? 1 : -1;
                z *= (i&1)? -1 : 1;
            }
            this.vertices_.push([x, y, z, 1.0]);
            this.position.push([x, y, z, 1.0]);
        }
    }
}

BoxGeometry.prototype.constructor = BoxGeometry;

BoxGeometry.prototype.addTexture = function(src) {
    this.textureSrc = src;
    for(let i = 0; i < BOX_GEOMETRY_FACE; i+=this.step){
        this.textureCoord.push(0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0);
    }
}

BoxGeometry.prototype.render = function() {
    this.temporaryMatrixWorld = this.matrixWorld;
    document.addEventListener(this.id, this.action.bind(this));
}

BoxGeometry.prototype.action = function() {
    
}

/* BOX END */

/* HURUF START */

function RGeometry(depth, width, height, color = new Color("0x00FF00")) {
    Geometry.call(this);

    this.type = 'geometry';
    var w = width || 3;
    var h = height || 6;
    var d = depth || 1;

    this.vertices = [

    ];

    this.indices = [

    ];
    this.position = [

    ]
    this.vertices_ = Object.assign([], this.position);
    this.normals = [];
    this.textureCoord = [];
    for(let i = 0; i < this.vertices.length / 3; i++){
        this.textureCoord.push(0.0, 0.0);
    }
    for(let i = 0; i < this.vertices.length / 6; i++){
        this.normals.push(0.0, 0.0, 1.0);
    }
    for(let i = 0; i < this.vertices.length / 6; i++){
        this.normals.push(0.0, 1.0, 0.0);
    }
    this.colors = []
    for(let i = 0; i < this.vertices.length / 3; i++){
        this.colors.push(color.r / 255, color.g / 255, color.b/ 255, 1.0);
    }

    this.textureSrc = undefined; //'Crate.jpg';
}

RGeometry.prototype.constructor = RGeometry;

RGeometry.prototype.render = function() {
    this.temporaryMatrixWorld = Object.assign({}, this.matrixWorld);
    document.addEventListener(this.id, this.action.bind(this));
}

RGeometry.prototype.findCenter = function() {
    let center = [0, 0, 0];
    for(let i = 0; i < this.position.length / 2; i++){
        center[0] += this.position[i][0];
        center[1] += this.position[i][1];
        center[2] += this.position[i][2];
    }
    center[0] /= this.position.length / 2;
    center[1] /= this.position.length / 2;
    center[2] /= this.position.length / 2;
    return center;
}

/* HURUF END */

/* COLLISION DETECTION */
class CollisionDetector{
    constructor(box, r){
        this.box = box;
        this.r = r;

        this.THRESHOLD = 0.05;
    }

    buildCollider(){
        let point = this.box.position;
        this.BACK = this.planeFromPoint(point[2], point[3], point[6]);
        this.FRONT = this.planeFromPoint(point[1], point[4], point[5]);
        this.RIGHT = this.planeFromPoint(point[1], point[3], point[5]);
        this.LEFT = this.planeFromPoint(point[0], point[2],point[4]);
        this.BOTTOM = this.planeFromPoint(point[1], point[2], point[3]);
        this.TOP = this.planeFromPoint(point[4], point[5], point[6]);
    }

    planeFromPoint(A, B, C) {
        let n = [], temp = [], temp2 = []
        temp = vec3.subtract(temp,B,A)
        temp2= vec3.subtract(temp2,C,B)
        n = vec3.cross(n,temp,temp2)

        let D = 0;
        D = vec3.dot(n.map(x =>-x), A)
        // Equation = n_x X + n_y Y + n_z Z - D = 0
        return n.concat(D)
    }

    distancePointToPlane(planeEq, point) {
        let new_point = point;
        let num = Math.abs(
            planeEq[0]*new_point[0] + 
            planeEq[1]*new_point[1] + 
            planeEq[2]*new_point[2] + planeEq[3])
        let denum = Math.sqrt(planeEq.slice(0,3).map(x => x*x).reduce((a,b) => a+b, 0))
        return num/denum
    }

    detect(){
        let pos = this.r.position;
        for(let i = 0; i < pos.length; i++){
            if(this.distancePointToPlane(this.TOP, pos[i]) < this.THRESHOLD && dir[1] > 0) {dir[1] *= -1; rotater *= -1; console.log("TOP"); return;}
            if(this.distancePointToPlane(this.TOP, pos[i]) < this.THRESHOLD && dir[1] < 0) {return;}
        }
        for(let i = 0; i < pos.length; i++){
            if(this.distancePointToPlane(this.BOTTOM, pos[i]) < this.THRESHOLD && dir[1] < 0) {dir[1] *= -1; rotater *= -1; console.log("BOTTOM"); return;}
            if(this.distancePointToPlane(this.BOTTOM, pos[i]) < this.THRESHOLD && dir[1] > 0) {return;}
        }
        for(let i = 0; i < pos.length; i++){
            if(this.distancePointToPlane(this.FRONT, pos[i]) < this.THRESHOLD && dir[2] > 0) {dir[2] *= -1; rotater *= -1; console.log("FRONT"); return;} 
            if(this.distancePointToPlane(this.FRONT, pos[i]) < this.THRESHOLD && dir[2] < 0) {return;}
        }
        for(let i = 0; i < pos.length; i++){
            if(this.distancePointToPlane(this.BACK, pos[i]) < this.THRESHOLD && dir[2] < 0) {dir[2] *= -1; rotater *= -1; console.log("BACK"); return;}
            if(this.distancePointToPlane(this.BACK, pos[i]) < this.THRESHOLD && dir[2] > 0) {return;}
        }
        for(let i = 0; i < pos.length; i++){
            if(this.distancePointToPlane(this.RIGHT, pos[i]) < this.THRESHOLD && dir[0] > 0) {dir[0] *= -1; rotater *= -1; console.log("RIGHT"); return;}
            if(this.distancePointToPlane(this.RIGHT, pos[i]) < this.THRESHOLD && dir[0] < 0) {return;}
        }
        for(let i = 0; i < pos.length; i++){
            if(this.distancePointToPlane(this.LEFT, pos[i]) < this.THRESHOLD && dir[0] < 0) {dir[0] *= -1; rotater *= -1; console.log("LEFT"); return;}
            if(this.distancePointToPlane(this.LEFT, pos[i]) < this.THRESHOLD && dir[0] < 0) {return;}
        }
    }
}

/* COLLISION DETECTION END */

/* GEOMETRY CLASS */
function Geometry(){
    this.id = btoa(Math.random()).substring(0,12);
    this.matrixWorld = mat4.create();

    this.temporaryMatrixWorld = undefined;

    this.rotation = {
        _x : 0,
        _y : 0,
        _z : 0,
        updateMatrixWorld : function(deg, array) {
            mat4.rotate(this.matrixWorld, this.matrixWorld, glMatrix.toRadian(deg), array);
        }.bind(this)
    }
    Object.defineProperties(this.rotation, {
        x : {
            get : function () {
                return this._x;
            },

            set: function (value) {
                this._x = value;
                this.updateMatrixWorld(this._x, [1, 0, 0]);
            }
        },
        y : {
            get : function () {
                return this._y;
            },

            set: function (value) {
                this._y = value;
                this.updateMatrixWorld(this._y, [0, 1, 0]);
            }
        },
        z : {
            get : function () {
                return this._z;
            },

            set: function (value) {
                this._z = value;
                this.updateMatrixWorld(this._z, [0, 0, 1]);
            }
        },
    });

    this.translate = {
        to : [0, 0, 0],
        updateMatrixWorld : function() {
            mat4.translate(this.matrixWorld, this.matrixWorld, this.translate.to);
        }.bind(this)
    }
    Object.defineProperties(this.translate,{
        mat : {
            get : function () {
                return this.to;
            },
            set : function (value) {
                this.to = value;
                this.updateMatrixWorld();
            },
        },
    });

    this.move = {
        direction : [0, 0, 0],
        vector : function(value) {
            this.direction[0] += value[0];
            this.direction[1] += value[1];
            this.direction[2] += value[2];
            this.updateMatrixWorld();
        },
        updateMatrixWorld : function() {
            mat4.translate(this.matrixWorld, this.matrixWorld, this.move.direction);
        }.bind(this)
    }

}

Geometry.prototype.constructor = Geometry;

/* GEOMETRY END */

/* MOUSE START */
var eventRightClick = new CustomEvent('right-click');

var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;
var THETA = 0, PHI = 0;

var mouseDown = function(e) {
    if(e.which === 1){
        drag = true;
        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
        return false;
    } else if (e.which === 3){
        e.preventDefault();
        document.dispatchEvent(eventRightClick);
    }
};

var mouseUp = function(e){
    if(e.which ===  1){
        drag = false;
    }
};

var mouseMove = function(e) {
    if(e.which === 1){
        if (!drag) return false;
        dX = (e.pageX-old_x)*2*Math.PI/GL.VIEWPORT_WIDTH/2,
        dY = (e.pageY-old_y)*2*Math.PI/GL.VIEWPORT_HEIGHT/2;
        THETA+= dX;
        PHI+=dY;
        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
    }
};

document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);
document.addEventListener("mouseout", mouseUp, false);
document.addEventListener("mousemove", mouseMove, false);
window.oncontextmenu = function (){
    return false;     // cancel default menu
}

/* MOUSE END */

/* OTHERS START */
function Color(hex){
    if(hex.charAt(0) == '0' && hex.charAt(1) === 'x'){
        hex = hex.substr(2);
    }
    let values = hex.split('');
    this.r = parseInt(values[0].toString() + values[1].toString(), 16);
    this.g = parseInt(values[2].toString() + values[3].toString(), 16);
    this.b = parseInt(values[4].toString() + values[5].toString(), 16);
}

function AmbientLight(color, intensity = 0.2) {
    this.type = 'ambient-light';
    this.color = {};
    console.log(color);
    this.color.r = (color.r - 0)/255 * intensity;
    this.color.g = (color.g - 0)/255 * intensity;
    this.color.b = (color.b - 0)/255 * intensity;
}

function PointLight(color, position) {
    this.type = 'point-light';
    this.color = {};
    this.color.r = (color.r - 0)/255;
    this.color.g = (color.g - 0)/255;
    this.color.b = (color.b - 0)/255;
    this.position = position;
}

function multiply(a,b) {
    let c1,c2,c3,c4;
    c1 = a[0]*b[0] + a[4]*b[1] + a[8]*b[2] + a[12]*b[3]
    c2 = a[1]*b[0] + a[5]*b[1] + a[9]*b[2] + a[13]*b[3]
    c3 = a[2]*b[0] + a[6]*b[1] + a[10]*b[2] + a[14]*b[3]
    c4 = a[3]*b[0] + a[7]*b[1] + a[11]*b[2] + a[15]*b[3]
    return [c1,c2,c3,c4]
}

/* OTHERS END */

