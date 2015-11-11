document.getElementById("footer").style.display = "none"; //don't show textarea
document.getElementById("lastfooter").style.display = "none"; //don't show settings form
document.getElementById("div_settingbutton").style.display = "block"; //show setting button
/*
*This function is called only from html file (button settings)
*/
function showdivsettingbutton(counterclics){
	if (counterclics%2!=0){
		document.getElementById("lastfooter").style.display = "block"; //show settings form
	}
	else{
		document.getElementById("lastfooter").style.display = "none"; //don't show settings form
	}
	counterclics=counterclics+1;
	return counterclics;
}	

/*CLASS point*/
function point (pcoord_x,pcoord_y){		
	this.x=pcoord_x; 			//public property
	this.y=pcoord_y;			//public property
	/*GETTERS*/
	this.get_x=function(){
	return this.x;
	}
	this.get_y=function(){
	return this.y;
	}
	this.get_ident=function(){
	return this.ident;
	}					
	/*SETTERS*/
	this.set_x=function(valor){
	this.x=valor; 
	}
	this.set_y=function(valor){
	this.y=valor; 
	}									
}
/*
*This function is to create the string called gcode following G-code language
*/
function createGcode1(n_points,numpoints1, initialheight, layerheight, numlayers, feedrate, ExtValueBuildUpPressure, ExtValueReleasePressure,v_matdiameter,v_nozzlediameter,pointshape,e){
  var actual_z=0;
  actual_z=actual_z+initialheight;
  gcode=";gcode generated from basicshapes.js\n";
  gcode=gcode+";developped by: David Vilella Riera\n";
  gcode=gcode+";THE CODE:\n";
  gcode=gcode+";Homing all axis\n";
  gcode=gcode+"G28\n";
  gcode=gcode+"; Set units to milimeters\n";
  gcode=gcode+"G21\n";
  gcode=gcode+"; Set absolute coordinates\n";
  gcode=gcode+"G90\n";
  gcode=gcode+";Reset extruder value\n";
  gcode=gcode+"G92 E0\n";
  gcode=gcode+";Move to the first point to the lowest Z axis height (by default Z=0) and set the movement feedrate (by default we use 3000mm/min)\n";
  var p_counter=0;
  gcode=gcode+"G1 X"+pointshape[p_counter].x.toFixed(4)+" Y"+pointshape[p_counter].y.toFixed(4)+" Z"+actual_z+" F"+feedrate+"\n";
  gcode=gcode+";Build up pressure\n";
  gcode=gcode+"G1 E"+ExtValueBuildUpPressure+" F200\n";
  gcode=gcode+"G92 E0\n";
  gcode=gcode+"G1 F"+feedrate+"\n";
  
	  for (var layer_counter=1; layer_counter <= numlayers; layer_counter = layer_counter+1){
		var numbershape=1;
		
		gcode=gcode+";Moving to the layer number "+(layer_counter)+"\n";
		if (layer_counter > 1) {
		actual_z=actual_z+layerheight;
		
		}
		gcode=gcode+"G1 Z"+actual_z+"\n";
		gcode=gcode+"G92 E0\n";
		if (layer_counter > 1){
		gcode=gcode+";Move to the first point ...................................\n";
		gcode=gcode+"G1 X"+pointshape[0].x.toFixed(4)+" Y"+pointshape[0].y.toFixed(4)+"\n";
		}	
		//1st shape
		for ( p_counter = 1; p_counter < numpoints1; p_counter = p_counter+1) {
			gcode=gcode+";Move to the point "+(p_counter+1)+"\n";
			gcode=gcode+"G1 X"+pointshape[p_counter].x.toFixed(4)+" Y"+pointshape[p_counter].y.toFixed(4)+" E"+e[p_counter].toFixed(4)+"\n"; 
		}	
			gcode=gcode+";to close shape "+numbershape+" we need to go back to the first point\n";
			gcode=gcode+"G1 X"+pointshape[0].x.toFixed(4)+" Y"+pointshape[0].y.toFixed(4)+" E"+e[p_counter].toFixed(4)+"\n"; 
		//2nd shape
		numbershape=numbershape+1; 
		for ( p_counter = numpoints1+1; p_counter <= n_points; p_counter = p_counter+1) {
			gcode=gcode+";Move to the point "+(p_counter+1)+"\n";
			gcode=gcode+"G1 X"+pointshape[p_counter-1].x.toFixed(4)+" Y"+pointshape[p_counter-1].y.toFixed(4)+" E"+e[p_counter-1].toFixed(4)+"\n";
		} 
			gcode=gcode+";to close shape "+numbershape+" we need to go back to the first point\n";
			gcode=gcode+"G1 X"+pointshape[numpoints1].x.toFixed(4)+" Y"+pointshape[numpoints1].y.toFixed(4)+" E"+e[p_counter-1].toFixed(4)+"\n";
		if (layer_counter >= 1){
		
		}	
		
	  } //end of layer for
  gcode=gcode+";Release pressure\n";
  var lastE= e[p_counter-1]-ExtValueReleasePressure;
  gcode=gcode+"G1 E"+lastE.toFixed(6)+" F200\n";
    gcode=gcode+";Set up the feedrate\n";
  gcode=gcode+"G1 F"+feedrate+"\n";
  gcode=gcode+";Homing all axis\n";
  gcode=gcode+"G28\n";  
  gcode=gcode+";Disable motors command\n";
  gcode=gcode+"M84";  
  return gcode;
} // END FUNCTION createGcode1
/*
*This function is to create the string called orderedpoints
*/
function createOrderedPoints(n,pointshape){
  var orderedpoints="";  //initializing variable string
  for (var i = 0; i <= n-2; i = i+1) {
     orderedpoints=orderedpoints+ "("+pointshape[i].x.toFixed(2)+","+pointshape[i].y.toFixed(2)+")" +";";
  } 
   orderedpoints=orderedpoints+"("+pointshape[n-1].x.toFixed(2)+","+pointshape[n-1].y.toFixed(2)+")";
return  orderedpoints;  
}
/*
*This function is to scale points to max dimension
*/
function  scalePointsToMaxDimension(n_points,pointshape){ 
  var big_axis=100.0; // it make reference that 100mmx100mm is the maximum area for printer
  /*calculate maximum and minimum difference for each axis*/
  var xmax = pointshape[0].x;
  var xmin = pointshape[0].x;
  for (i = 1; i <= n_points-1; i = i+1) {
    if (pointshape[i].x>xmax) {xmax=pointshape[i].x;}
    if (pointshape[i].x<xmin) {xmin=pointshape[i].x;}
  }
    
  var ymax = pointshape[0].y;
  var ymin = pointshape[0].y;
  for (i = 1; i <= n_points-1; i = i+1) {
    if (pointshape[i].y>ymax) {ymax=pointshape[i].y;}
    if (pointshape[i].y<ymin) {ymin=pointshape[i].y;}
  }
  var x_difference=xmax-xmin;
  var y_difference=ymax-ymin;
    
  /*calculating x_scale and y_scale according to which difference is bigger*/
  if (y_difference>x_difference) {
    var y_scale=big_axis/y_difference;
    var x_scale=x_difference/y_difference*y_scale;
   }
  else {
    var x_scale=big_axis/x_difference;
    var y_scale=y_difference/x_difference*x_scale;
   }
  
  /*scaling points: we need to multiply each point value for its axis scale*/
  for (i = 0; i <= n_points-1; i = i+1) {
    pointshape[i].x=pointshape[i].x*x_scale;
    pointshape[i].y=pointshape[i].y*y_scale;
  }  
return pointshape;  
}  
/*
*This function is to calculate the parametric points of an ellipse
*/ 
function calcEllipsePoints(n_points, c_width, c_length){
 var pointshape1 = new Array;	
 var a = c_width/2.0;
 var b = c_length/2.0;
 var rad=0.0;
 var inc = 2*Math.PI/n_points;
 for (p_counter = 0; p_counter < n_points; p_counter = p_counter+1) {
   pointshape1[p_counter] = new point (a*Math.cos(rad),b*Math.sin(rad));
   rad= rad + inc;   
 }
return pointshape1;
} 
/*
*This function is create extrusion values used in gcode function
*/ 
function createextrusionvalues(d,numpoints2,numpoints1,numlayers,v_matdiameter,v_nozzlediameter){
	var e = new Array;
/*Calculating nozzle_material_surfaces_ratio*/
	var v_materialsurface=Math.PI*Math.pow((v_matdiameter/2.0),2);
	var v_nozzlesurface=Math.PI*Math.pow((v_nozzlediameter/2.0),2);
	var nozzle_material_surfaces_ratio=v_nozzlesurface/v_materialsurface;
	
var numpoints_3d=numpoints1*numlayers+numpoints2*numlayers; //calculating num points 
var i=0;

var actual_layer=1;
	e[0]=0;
	if (actual_layer=1){
		for (var p_counter = 1; p_counter <= numpoints1; p_counter = p_counter+1) {
			e[p_counter]=e[p_counter-1]+d[p_counter-1]*nozzle_material_surfaces_ratio;
		}
		
		for (var p_counter = numpoints1+1; p_counter <= (numpoints1+numpoints2); p_counter = p_counter+1) {
			e[p_counter]=e[p_counter-1]+d[p_counter-1]*nozzle_material_surfaces_ratio;
		}
	}
	actual_layer=actual_layer+1; 
	while(actual_layer<=numlayers){
		new_p_counter=1;
		for (var p_counter = ((actual_layer-1)*(numpoints1+numpoints2)+1); p_counter < ((actual_layer-1)*(numpoints1+numpoints2)+numpoints1+1); p_counter = p_counter+1) {
			e[p_counter]=e[p_counter-1]+d[new_p_counter-1]*nozzle_material_surfaces_ratio;
			new_p_counter=new_p_counter+1;
		}
		new_p_counter=numpoints1;
		for (p_counter = ((actual_layer-1)*(numpoints1+numpoints2)+numpoints1+1); p_counter < (((actual_layer)*(numpoints1+numpoints2))+1); p_counter = p_counter+1) {
			e[p_counter]=e[p_counter-1]+d[new_p_counter]*nozzle_material_surfaces_ratio;
			new_p_counter=new_p_counter+1;
		}	
		actual_layer=actual_layer+1;
	}	
return e;
}
/*
*This function is to calculate extrusion values into array e[]
*/
function distancesarray(numpoints,numpoints1,pointshape){
   var d1 = new Array;
    
  /*Calculating array of distances between points shape 1*/
  for (var i = 0; i < numpoints1-1; i = i+1) {
  d1[i]=Math.sqrt(Math.pow((pointshape[i].x-pointshape[i+1].x),2)+Math.pow((pointshape[i].y-pointshape[i+1].y),2));
  }
  d1[numpoints1-1]=Math.sqrt(Math.pow((pointshape[numpoints1-1].x-pointshape[0].x),2)+Math.pow(((pointshape[numpoints1-1].y-pointshape[0].y)),2));
 
   /*Calculating array of distances between points shape 2*/
  for (var i = numpoints1; i < numpoints-1; i = i+1) {
  d1[i]=Math.sqrt(Math.pow((pointshape[i].x-pointshape[i+1].x),2)+Math.pow((pointshape[i].y-pointshape[i+1].y),2));
  }
  d1[(numpoints-1)]=Math.sqrt(Math.pow((pointshape[(numpoints-1)].x-pointshape[numpoints1].x),2)+Math.pow(((pointshape[(numpoints-1)].y-pointshape[numpoints1].y)),2));
  /*document.write(d1);*/
return d1;
} 
/*
*Main program**************************************************************************************************************************************************************
*/ 	
//Variables required

var frame=1;
var counter_clics=0;
var drawframe2=true;
var posXbutton1=480;
var posYbutton1 =350;
var Diam_button1=200;	
var e = new Array;		//array of extrusion values		
var numpoints1;
var numpoints2;
var totalpoints;

/*
*MAIN FUCTION RUNNING WITH PROCESSING AND JAVASCRIPT INSTRUCTIONS
*/
function myprocess(processing) {
	/*
	*The setup() function is run once, when the program starts. 
	*It's used to define initial enviroment properties such as screen size and to load media such as images and fonts as the program starts. 
	*There can only be one setup() function for each program and it shouldn't be called again after its initial execution.
	*/	
	processing.setup = function(){
		var sizescreenx = 960;
		var sizescreeny = 700;
		processing.size(sizescreenx,sizescreeny);  //screen size
		processing.frameRate(15);  //frames per second that function draw will run	
		
		imgbackground1 = processing.loadImage ("data/backgroundcanvasframe1.jpg"); 
		imgbackground2 = processing.loadImage ("data/backgroundcanvasframe2.jpg"); 	
		imgtext1 = processing.loadImage ("data/text1_frame1.png");  
		imgtext2 = processing.loadImage ("data/text2_frame1.png"); 		
		imgtext3 = processing.loadImage ("data/text3_frame1.png"); 
		imgtext4 = processing.loadImage ("data/text4_frame1.png"); 		
	}	//end of setup processing function	
	/*
	*The draw() function is executed it depends of de frameRate setup function
	*/						
	processing.draw = function() {							
		/*defined screen size variables*/
		var sizescreenx = 960;
		var sizescreeny = 700;
		var orderedpoints="";  //initializing variable string
		/*
		*This function drawAxis is to draw the axis in grey color
		*/							
		function drawAxis(){
			processing.stroke(150,150,150); //stroke color
			processing.fill(150,150,150);  //fill color RGB																
			//drawing axis and arrows
			processing.pushMatrix();
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			processing.ellipse(0, 0, 5, 5);
			processing.line(0,0,325,0);
			processing.triangle(325,0, 320, 5, 320, -5);
			processing.rotate(Math.PI/2.0);
			processing.line(0,0,325,0);
			processing.triangle(325,0, 320, 5, 320, -5);
			processing.rotate(Math.PI/2.0);
			processing.line(0,0,325,0);
			processing.triangle(325,0, 320, 5, 320, -5);
			processing.rotate(Math.PI/2.0);
			processing.line(0,0,325,0);    
			processing.triangle(325,0, 320, 5, 320, -5);
			processing.popMatrix(); 
		}
		/*
		*Below two functions are simulate that the button click here when mouse is over it
		*/		
		function onCircle (x, y, diameter) {
			var disX = x - processing.mouseX;
			var disY = y - processing.mouseY;
			if (Math.sqrt(Math.pow(disX, 2) + Math.pow(disY,2)) < diameter/2 ) {
			return true;
			}
			else {
			return false;
			}
		}		
		function update1(x,y) {  
			if (onCircle(posXbutton1, posYbutton1, Diam_button1) ) {
				processing.image (imgtext2, 2, 2);	
			}  		 	
		}
		
		/*
		*This function is to draw a star and define their points
		*/
		function star(x_center,  y_center, radius1, radius2, npoints) {
			var angle = 2*Math.PI / npoints;
			var halfAngle = angle/2.0;
			var i=-1;
			var pointshape = new Array;		//array of points	
			
			processing.beginShape();
			for (a = 0; a < 2*Math.PI; a += angle) {
				var sx = x_center + Math.cos(a) * radius2;
				var sy = y_center + Math.sin(a) * radius2;
				 
				processing.vertex(sx, sy);
				i=i+1;
				pointshape[i] = new point (sx,sy);				
				
				sx = x_center + Math.cos(a+halfAngle) * radius1;
				sy = y_center + Math.sin(a+halfAngle) * radius1;
				processing.vertex(sx, sy);
				i=i+1;
				pointshape[i] = new point (sx,sy);	
			}
		  processing.endShape(processing.CLOSE);  
		return  pointshape; 
		}
		/*
		*This function is to draw a flower and define their points
		*/
		function flower(radius1, radius2,npoints) {
			var angle = 2*Math.PI / npoints;
			var i=0;	
			var pointshape = new Array;		//array of points				
			processing.beginShape();
			for (a = 0; a < 2*Math.PI; a += angle) {
				var sx = ((radius1+radius2)*Math.cos(a))-(radius2 *Math.cos(((radius1+radius2)/radius2)*a));
				var sy = ((radius1+radius2)*Math.sin(a))-(radius2 *Math.sin(((radius1+radius2)/radius2)*a));
				processing.vertex(sx, sy);
				pointshape[i] = new point (sx,sy);
				i=i+1;	
			}
		  processing.endShape(processing.CLOSE);  
		return  pointshape; 
		}		
		/*
		*This function is to draw a rounded star and define their points
		*/
		function roundedstar(radius1, radius2,npoints) {
			var angle = 2*Math.PI / npoints;
			var i=0;
			var pointshape = new Array;		//array of points			  
			processing.beginShape();
			for (a = 0; a < 2*Math.PI; a += angle) {
				var sx = ((radius1-radius2)*Math.cos(a))+(radius2 *Math.cos(((radius1-radius2)/radius2)*a));
				var sy = ((radius1-radius2)*Math.sin(a))-(radius2 *Math.sin(((radius1-radius2)/radius2)*a));
				processing.vertex(sx, sy);
				pointshape[i] = new point (sx,sy);
				i=i+1;	
			}
		  processing.endShape(processing.CLOSE);  
		return  pointshape; 
		}		
		/*
		*This function is to draw a heart and define their points
		*/
		function heart(a,b,c,d,e,npoints) {
			var angle = 2*Math.PI / npoints;
			var i=0;
			var pointshape = new Array;		//array of points	
		  
			processing.beginShape();
			for (x = 0; x < 2*Math.PI; x += angle) {
				var sx = a*Math.pow(Math.sin(x),3);
				var sy = b*Math.cos(x)-c*Math.cos(2*x)-d*Math.cos(3*x)-e*Math.cos(4*x);
				processing.vertex(sx, sy);
				pointshape[i] = new point (sx,sy);
				i=i+1;	
			}
		  processing.endShape(processing.CLOSE);  
		return  pointshape; 
		}
		/*
		*This function is to draw the canvas on frame 1----------------------------------------------------------------------------------------------------------------------
		*/
		function canvasframe1() {
			/*hidding and showing divs of html*/
			document.getElementById("content1").style.display = "block"; //show birthday form
			document.getElementById("buttongcode").style.display = "none"; //don't show button gcode
			document.getElementById("div_settingbutton").style.display = "block"; //show setting button
			document.getElementById("footer").style.display = "none"; //don't show textarea
			
			
			/*drawing images on frame1*/
			processing.image (imgbackground1, 0, 0); 
			processing.image (imgtext1, 0, 0); 
			processing.image (imgtext2, 0, 0); 
			processing.image (imgtext3, 0, 0); 			
			update1(processing.mouseX, processing.mouseY); //to simulate the that you are over "click here" button  		
		}			
		/*
		*This function is to draw the canvas on frame 2----------------------------------------------------------------------------------------------------------------------
		*/
		function canvasframe2(day,month,year) {
			/*hidding and showing divs of html*/
			document.getElementById("content1").style.display = "none"; //don't show birthday form
			document.getElementById("buttongcode").style.display = "block"; //show button gcode	
			document.getElementById("div_settingbutton").style.display = "none"; //don't show setting button	
			document.getElementById("lastfooter").style.display = "none"; //don't show settings form
			document.getElementById("footer").style.display = "block"; //show textarea
			
			/*drawing images on frame2*/
			processing.image (imgbackground2, 0, 0); 
			processing.image (imgtext4, 0, 0);	
			/*drawAxis();	*/
			
			/*show variables from birthday date*/
			processing.fill(255,0,0);
			processing.textAlign(processing.LEFT);
			processing.textSize(20);
			processing.text(day+"/"+month+"/"+year,15,25);	// background color RGB	
						
			/*obtain values from html form of settings*/			
			var v_iheight = parseFloat(document.getElementById("id_iheight").value);
			var v_layerheight = parseFloat(document.getElementById("id_layerheight").value);
			var v_numlayers = parseInt(document.getElementById("id_numlayers").value);
			var v_feedrate = parseInt(document.getElementById("id_feedrate").value);
			var v_matdiameter = parseFloat(document.getElementById("id_matdiameter").value);
			var v_nozzlediameter = parseFloat(document.getElementById("id_nozzlediameter").value);
			var v_ExtValueBuildUpPressure = parseFloat(document.getElementById("id_ExtValueBuildUpPressure").value);
			var v_ExtValueReleasePressure = parseFloat(document.getElementById("id_ExtValueReleasePressure").value);						
						
			/*-----------------------------------------------------------BEGIN RANDOM DESIGN---------------------------------------------------------------*/
			totalpoints=0;
			var gcode="";  //initializing variable string	
			
			/*var n_selected = parseInt(processing.random(1,6.499)); //RANDOM SHAPE 1	*/
			var n_selected = parseInt((Math.random() * (5.999 - 1) + 1)); //RANDOM SHAPE 1 GENERATE A ENTER NUMBER OF RANGE (1-5)			
			/*1-2 random parameters rectangle and ellipse*/
			var v_width = parseInt(processing.random(500,600)); 
			var v_height = parseInt(processing.random(500,600));
			/*n_selected = 1; v_width=600; v_height=600;*/
			
			/*3 random parameters star*/			
			var star_radius1 = parseInt(processing.random(250,275));
			var star_radius2 = parseInt(processing.random(300,310));			
			var v_pointsstar = parseInt(processing.random(18,35));
			/*4 random parameters flower*/
			var flower_radius1 = parseInt(processing.random(250,275));
			var v_npetalsflower = parseInt(processing.random(12,35));
			/*5 random parameters roundedstar*/
			var roundedstar_radius1 = parseInt(processing.random(250,300));
			var v_ncurvesroundedstar = parseInt(processing.random(12,35));				
						
			processing.noFill(); // no fill shapes
			processing.strokeWeight(3);  // Thicker
			processing.stroke(100,100,100);   // stroke color RGB 
			switch(n_selected) {
				case 1: /*RECTANGLE*/
					numpoints1=4; //number of points of rectangle
					var pointshape1 = new Array; 	//array of points		
					processing.pushMatrix();
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					pointshape1[0] = new point (-(v_width/2.0),-(v_height/2.0));
					pointshape1[1] = new point (pointshape1[0].x+v_width,pointshape1[0].y);											
					pointshape1[2] = new point (pointshape1[0].x+v_width,pointshape1[0].y+v_height);
					pointshape1[3] = new point (pointshape1[0].x,pointshape1[0].y+v_height);
					processing.rect(pointshape1[0].x,pointshape1[0].y,v_width,v_height); //drawing rectangle
					processing.popMatrix(); 					
				break;									
				case 2: /*ELLIPSE*/
					numpoints1=256; //number of points of ellipse
					var pointshape1 = new Array;		
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					pointshape1=calcEllipsePoints(numpoints1, v_width, v_height);
					processing.ellipse(0,0,v_width,v_height); //drawing ellipse
					processing.popMatrix(); 												
				break;				
				case 3: /*STAR*/
					numpoints1=v_pointsstar*2; //number of points of star
					var pointshape1 = new Array;		
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					pointshape1=star(0, 0, star_radius1, star_radius2,v_pointsstar);  //draw the star and define pointshape
					processing.popMatrix(); 					
				break;				
				case 4: /*FLOWER*/
					numpoints1=360; //number of points of flower
					var pointshape1 = new Array;		//array of points
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					/*if (v_npetalsflower>2) {flower_radius1=180;} else {flower_radius1=100;}*/
					flower_radius2=flower_radius1/v_npetalsflower;	
					pointshape1=flower(flower_radius1,flower_radius2,numpoints1);  //draw the flower and define pointshape
					processing.popMatrix();					
				break;					
				case 5: /*ROUNDED STAR*/
					numpoints1=360; //number of points of rounded star
					var pointshape1 = new Array;		//array of points
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					if (v_ncurvesroundedstar<=2) {v_ncurvesroundedstar=3}
					roundedstar_radius2=roundedstar_radius1/v_ncurvesroundedstar;	
					pointshape1=roundedstar(roundedstar_radius1,roundedstar_radius2,numpoints1);  //draw the rounded star and define pointshape
					processing.popMatrix(); 					
				break;					
		}// END OF SWITCH 1 FIRST SHAPE*********************************************************************************************************************************************
			totalpoints=totalpoints+numpoints1;
			// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
		
			var n_selected = parseInt((Math.random() * (7.999 - 1) + 1)); //RANDOM SHAPE 2 GENERATE A ENTER NUMBER OF RANGE (1-7)	
			/*1-2-3 random parameters rectangle triangle and ellipse*/
			var v_width = parseInt(processing.random(200,400)); 
			var v_height = parseInt(processing.random(200,400));
			/*n_selected = 1; v_width=300; v_height=300;*/
			
			/*4 random parameters star*/
			var star_radius1 = parseInt(processing.random(100,150));
			var star_radius2 = parseInt(processing.random(180,200));			
			var v_pointsstar = parseInt(processing.random(5,10));
			/*5 random parameters flower*/
			var flower_radius1 = parseInt(processing.random(175,225));
			var v_npetalsflower = parseInt(processing.random(12,35));
			/*6 random parameters roundedstar*/
			var roundedstar_radius1 = parseInt(processing.random(150,200));
			var v_ncurvesroundedstar = parseInt(processing.random(6,12));	
			/*7 random parameters heart*/
			var v_sizeheart = parseInt(processing.random(10,15));			
			
			processing.noFill(); // no fill shapes
			processing.strokeWeight(3);  // Thicker
			processing.stroke(150,150,150);   // stroke color RGB 
			switch(n_selected) {
				case 1: /*RECTANGLE*/
					numpoints2=4;
					var pointshape2 = new Array;		//array of points
					processing.pushMatrix();
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					pointshape2[0] = new point (-(v_width/2.0),-(v_height/2.0));
					pointshape2[1] = new point (pointshape2[0].x+v_width,pointshape2[0].y);											
					pointshape2[2] = new point (pointshape2[0].x+v_width,pointshape2[0].y+v_height);
					pointshape2[3] = new point (pointshape2[0].x,pointshape2[0].y+v_height);
					processing.rect(pointshape2[0].x,pointshape2[0].y,v_width,v_height); //drawing rectangle
					processing.popMatrix(); 					
				break;									
				case 2: /*TRIANGLE*/
					numpoints2=3;
					var pointshape2 = new Array;		//array of points
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					pointshape2[0] = new point (-(v_width/2.0),(v_height/2.0));
					pointshape2[1] = new point (pointshape2[0].x+(v_width/2),pointshape2[0].y-v_height);
					pointshape2[2] = new point (v_width+pointshape2[0].x,pointshape2[0].y);
					processing.triangle(pointshape2[0].x,pointshape2[0].y,pointshape2[1].x,pointshape2[1].y,pointshape2[2].x,pointshape2[2].y);//drawing triangle
					processing.popMatrix(); 					
				break;									
				case 3: /*ELLIPSE*/
					numpoints2=256; //number of points of ellipse
					var pointshape2 = new Array;		//array of points
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					pointshape2=calcEllipsePoints(numpoints2, v_width, v_height);
					processing.ellipse(0,0,v_width,v_height); //drawing ellipse
					processing.popMatrix(); 												
				break;				
				case 4: /*STAR*/
					numpoints2=v_pointsstar*2; //number of points of star
					var pointshape2 = new Array;		//array of points
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					pointshape2=star(0, 0, star_radius1, star_radius2,v_pointsstar);  //draw the star and define pointshape
					processing.popMatrix(); 					
				break;				
				case 5: /*FLOWER*/
					numpoints2=360; //number of points of flower
					var pointshape2 = new Array;		//array of points
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					/*if (v_npetalsflower>2) {flower_radius1=180;} else {flower_radius1=100;}*/
					flower_radius2=flower_radius1/v_npetalsflower;	
					pointshape2=flower(flower_radius1,flower_radius2,numpoints2);  //draw the flower and define pointshape
					processing.popMatrix();					
				break;					
				case 6: /*ROUNDED STAR*/
					numpoints2=360; //number of points of rounded star
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					if (v_ncurvesroundedstar<=2) {v_ncurvesroundedstar=3}
					roundedstar_radius2=roundedstar_radius1/v_ncurvesroundedstar;	
					pointshape2=roundedstar(roundedstar_radius1,roundedstar_radius2,numpoints2);  //draw the rounded star and define pointshape
					processing.popMatrix(); 					
				break;				
				case 7: /*HEART*/
					numpoints2=360; //number of points of heart
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
					processing.rotate(Math.PI); //rotate coordinates 180 degrees
					pointshape2=heart(16*v_sizeheart,13*v_sizeheart,5*v_sizeheart,2*v_sizeheart,1*v_sizeheart,numpoints2);  //draw the heart and define pointshape, numbers are fixed with formula on wolfram mathworld.com
					processing.popMatrix(); 					
				break;	
				
		}// END OF SWITCH 2 SECOND SHAPE **************************************************************************************************************************************
				totalpoints=totalpoints+numpoints2;
				
				processing.fill(0,0,0);				
				var numpoints_3d=numpoints1*v_numlayers+numpoints2*v_numlayers;
				/*processing.text(numpoints_3d,15,55);*/
				/*processing.text("totalpoints="+totalpoints+"--numpoints1="+numpoints1+"--numpoints2="+numpoints2,15,30);*/
				
				totalpointshape=pointshape1.concat(pointshape2); //concat the two pointshapes
				totalpointshape=scalePointsToMaxDimension(totalpoints,totalpointshape); //SCALING POINTS TO MAX DIMENSION		
				orderedpoints=createOrderedPoints(totalpoints,totalpointshape); //create variable string orderedpoints
				/*processing.text(orderedpoints,15,45);*/				
				d=distancesarray(totalpoints,numpoints1,totalpointshape);	//CREATE ARRAY OF DISTANCES			
				e=createextrusionvalues(d,numpoints2,numpoints1,v_numlayers,v_matdiameter,v_nozzlediameter); //CREATE ARRAY OF EXTRUSION VALUES
				gcode=createGcode1(totalpoints,numpoints1,v_iheight,v_layerheight, v_numlayers, v_feedrate,v_ExtValueBuildUpPressure,v_ExtValueReleasePressure,v_matdiameter,v_nozzlediameter,totalpointshape,e);	 //CREATE GCODE STRING VARIABLE
		
				drawframe2=false;				
		} //END OF FUNCTION CANVASFRAME2----------------------------------------------------------------------------------------------------------------------------------
		
		/*
		*following block is to change frames
		*/
		if (counter_clics%2!=0){
		frame=2;
		}  else	  {	
		frame=1;
		}  		  
		switch (frame){
			case 1: 
				canvasframe1();				
			break;
			case 2:
				if(drawframe2){
				/*obtain values from html birthday form*/
				var v_day = parseInt(document.getElementById("id_day").value);
				var v_month = parseInt(document.getElementById("id_month").value);
				var v_year = parseInt(document.getElementById("id_year").value);
				canvasframe2(v_day,v_month,v_year);
				}	
			break;
		}			
		document.getElementById("gcode").innerHTML = gcode;							
	};	//end of draw processing function
	/*
	*This function mouseClicked is executed when you click mouse button on canvas screen
	*/
	processing.mouseClicked = function() {
		counter_clics=counter_clics+1;
		if (counter_clics%2!=0){
			drawframe2=true;		
		}		
	}
} //end of function myprocess
var canvas = document.getElementById("micanvas"); 
var miInstanciaProcessing = new Processing(canvas, myprocess);
					
									
						

