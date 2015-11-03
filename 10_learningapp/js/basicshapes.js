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
*This function is to create the string called orderedpoints
*/
function createOrderedPoints(n,pointshape){
  var orderedpoints="";  //initializing variable string
  for (i = 0; i <= n-2; i = i+1) {
     orderedpoints=orderedpoints+ "("+pointshape[i].x.toFixed(2)+","+pointshape[i].y.toFixed(2)+")" +";";
  } 
   orderedpoints=orderedpoints+"("+pointshape[n-1].x.toFixed(2)+","+pointshape[n-1].y.toFixed(2)+")";
return  orderedpoints;  
}
	
/*
*This function is to create the string called gcode following G-code language
*/
function createGcode(n_points, initialheight, layerheight, numlayers, feedrate, ExtValueBuildUpPressure, ExtValueReleasePressure,pointshape,e){
  var actual_z=initialheight;
  
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
   
  for ( p_counter = 1; p_counter < n_points; p_counter = p_counter+1) {
    gcode=gcode+";Move to the point "+(p_counter+1)+"\n";
    gcode=gcode+"G1 X"+pointshape[p_counter].x.toFixed(4)+" Y"+pointshape[p_counter].y.toFixed(4)+" E"+e[p_counter].toFixed(6)+"\n"; 
  }
  
  gcode=gcode+";to close shape we need to go back to the first point\n";
  p_counter=0;
  gcode=gcode+"G1 X"+pointshape[p_counter].x.toFixed(4)+" Y"+pointshape[p_counter].y.toFixed(4)+" E"+e[n_points].toFixed(6)+"\n"; 
  
  //adding 2.5D to gcode file
  if(numlayers>1){
	  for ( layer_counter = 1; layer_counter < numlayers; layer_counter = layer_counter+1){
		gcode=gcode+";Moving to the layer number "+(layer_counter+1)+"\n";
		actual_z=actual_z+layerheight;
		gcode=gcode+"G1 Z"+actual_z+"\n"; 
		for ( p_counter = 1; p_counter < n_points; p_counter = p_counter+1) {
			gcode=gcode+";Move to the point "+(p_counter+1)+"\n";
			gcode=gcode+"G1 X"+pointshape[p_counter].x.toFixed(4)+" Y"+pointshape[p_counter].y.toFixed(4)+" E"+e[layer_counter*n_points+p_counter].toFixed(6)+"\n"; 
		}
		gcode=gcode+";to close shape we need to go back to the first point\n";
		p_counter=0;
		gcode=gcode+"G1 X"+pointshape[p_counter].x.toFixed(4)+" Y"+pointshape[p_counter].y.toFixed(4)+" E"+e[layer_counter*n_points+n_points].toFixed(6)+"\n";
		
	  }
  }		
  //END of adding 2.5D to gcode file
  
  gcode=gcode+";Release pressure\n";
  var lastE= e[(n_points*numlayers)]-ExtValueReleasePressure;
  gcode=gcode+"G1 E"+lastE.toFixed(6)+" F200\n";
  
  gcode=gcode+";Set up the feedrate\n";
  gcode=gcode+"G1 F"+feedrate+"\n";
  
  gcode=gcode+";Homing all axis\n";
  gcode=gcode+"G28\n";  
  
  gcode=gcode+";Disable motors command\n";
  gcode=gcode+"M84";  

  return gcode;
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
*This function is to calculate extrusion values into array e[]
*/
function calculateExtrusionValues(numpoints,numlayers,v_matdiameter,v_nozzlediameter,pointshape){
  var e = new Array;
  var d = new Array;
  
  /*Calculating nozzle_material_surfaces_ratio*/
	var v_materialsurface=Math.PI*Math.pow((v_matdiameter/2.0),2);
	var v_nozzlesurface=Math.PI*Math.pow((v_nozzlediameter/2.0),2);
	var nozzle_material_surfaces_ratio=v_nozzlesurface/v_materialsurface;
  
  /*Calculating array of distances between points*/
  for (i = 1; i < numpoints; i = i+1) {
  d[i]=Math.sqrt(Math.pow((pointshape[i].x-pointshape[i-1].x),2)+Math.pow((pointshape[i].y-pointshape[i-1].y),2));
  }
  d[numpoints]=Math.sqrt(Math.pow((pointshape[numpoints-1].x-pointshape[0].x),2)+Math.pow(((pointshape[numpoints-1].y-pointshape[0].y)),2));
  
 /*Calculating array of extrusion values between points*/
	var numpoints_3d=numpoints*numlayers; //calculating num points 
	e[0]=0; /*first extrusion value*/
	var z=1;
 	for (i = 1; i < numpoints_3d; i = i+1) {
        e[i]=e[i-1]+d[z]*nozzle_material_surfaces_ratio;  	
		z=z+1;	
		if (z>=numpoints){z=1;} 
	}  	
	e[numpoints_3d]=e[numpoints_3d-1]+d[numpoints]*nozzle_material_surfaces_ratio; /*last extrusion value*/
	
	/*document.write(e);*/
return e;
}  
							
/*
*Main program
*/ 	

//Variables required
var pointshape = new Array;		//array of points
var e = new Array;		//array of extrusion values					
		
/*
*The setup() function is run once, when the program starts. 
*It's used to define initial enviroment properties such as screen size and to load media such as images and fonts as the program starts. 
*There can only be one setup() function for each program and it shouldn't be called again after its initial execution.
*/
function myprocess(processing) {
	processing.setup = function(){
		var sizescreenx = 700;
		var sizescreeny = 700;
		processing.size(sizescreenx,sizescreeny);  //screen size
		processing.frameRate(15);  //frames per second that function draw will run
		var c_blue=processing.color(0,0,255);       //initializing variable color RGB
		var c_white=processing.color(255,255,255);  //initializing variable color RGB
		var c_red =processing.color(255,0,0);       //initializing variable color RGB
		var c_black =processing.color(0,0,0);      //initializing variable color RGB
		var c_grey =processing.color(150,150,150);  //initializing variable color RGB    
	}	//end of setup processing function			
						
	processing.draw = function() {							
		/*defined screen size variables*/
		var sizescreenx = 700;
		var sizescreeny = 700;	
		
		/*obtain values from html form*/
		var optionselected = document.getElementById("shapetodraw").value;
		var v_width= parseInt(document.getElementById("id_width").value);
		var v_height=parseInt(document.getElementById("id_height").value);
		
		var v_pointsstar = parseInt(document.getElementById("n_pointsstar").value);
		var v_radius1 = parseInt(document.getElementById("id_radius1").value);
		var v_radius2 = parseInt(document.getElementById("id_radius2").value);
		
		var v_iheight = parseFloat(document.getElementById("id_iheight").value);
		var v_layerheight = parseFloat(document.getElementById("id_layerheight").value);
		var v_numlayers = parseInt(document.getElementById("id_numlayers").value);
		
		var v_feedrate = parseInt(document.getElementById("id_feedrate").value);
		var v_matdiameter = parseFloat(document.getElementById("id_matdiameter").value);
		var v_nozzlediameter = parseFloat(document.getElementById("id_nozzlediameter").value);
		var v_ExtValueBuildUpPressure = parseFloat(document.getElementById("id_ExtValueBuildUpPressure").value);
		var v_ExtValueReleasePressure = parseFloat(document.getElementById("id_ExtValueReleasePressure").value);						
							
		/*initialiting variable n_selected */
		  if (optionselected == "Rectangle") {var n_selected=1;}
		  if (optionselected == "Triangle") {var n_selected=2;}
		  if (optionselected == "Ellipse") {var n_selected=3;}
		  if (optionselected == "Star") {var n_selected=4;}  
	
		var orderedpoints="";  //initializing variable string
		var gcode="";  //initializing variable string	
		processing.background(255,255,255);	// background color RGB
																			
		/*
		*This function drawAxis is to draw the axis in grey color
		*/							
		function drawAxis(){
			processing.stroke(150,150,150); //stroke color
			processing.fill(150,150,150);  //fill color RGB
			
			//drawing text for end of axis
			processing.textSize(14);
			processing.text("y-",350,15);
			processing.text("y+",350,690);
			processing.text("x+",680,350);
			processing.text("x-",5,350);
			processing.text("(0,0)",355,365);
												
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
		*This function is to draw a star and define their points
		*/
		function star(x_center,  y_center, radius1, radius2, npoints) {
			var angle = 2*Math.PI / npoints;
			var halfAngle = angle/2.0;
			var i=-1;
		  
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

		switch(n_selected) {
				case 1:
					var numpoints=4;
					drawAxis();	// instance to drawAxis	function			
					processing.noFill(); // no fill shapes
					processing.stroke(0,0,255);   // stroke color RGB - blue
					processing.pushMatrix();
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
										
					//define ordered points for square
					pointshape[0] = new point (-(v_width/2.0),-(v_height/2.0));
					pointshape[1] = new point (pointshape[0].x+v_width,pointshape[0].y);											
					pointshape[2] = new point (pointshape[0].x+v_width,pointshape[0].y+v_height);
					pointshape[3] = new point (pointshape[0].x,pointshape[0].y+v_height);
																														
					processing.rect(pointshape[0].x,pointshape[0].y,v_width,v_height); //drawing rectangle
					processing.popMatrix(); 
										
					orderedpoints=createOrderedPoints(numpoints,pointshape); //create variable string orderedpoints
					pointshape=scalePointsToMaxDimension(numpoints,pointshape); //scaling points to max dimension of printer
					e=calculateExtrusionValues(numpoints,v_numlayers,v_matdiameter,v_nozzlediameter,pointshape); //calculating extruding values
					gcode=createGcode(numpoints,v_iheight,v_layerheight, v_numlayers, v_feedrate,v_ExtValueBuildUpPressure,v_ExtValueReleasePressure,pointshape,e); //create variable string gcode	
				break;
									
				case 2:
					var numpoints=3;
					drawAxis();	// instance to drawAxis	function	
					processing.noFill(); // no fill shapes
					processing.stroke(0,0,255);   // stroke color RGB - blue
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
										
					//define ordered points for triangle
					pointshape[0] = new point (-(v_width/2.0),(v_height/2.0));
					pointshape[1] = new point (pointshape[0].x+(v_width/2),pointshape[0].y-v_height);
					pointshape[2] = new point (v_width+pointshape[0].x,pointshape[0].y);
																				
					processing.triangle(pointshape[0].x,pointshape[0].y,pointshape[1].x,pointshape[1].y,pointshape[2].x,pointshape[2].y);//drawing triangle
					processing.popMatrix();  
										
					orderedpoints=createOrderedPoints(numpoints,pointshape); //create variable string orderedpoints	
					pointshape=scalePointsToMaxDimension(numpoints,pointshape); //scaling points to max dimension of printer
					e=calculateExtrusionValues(numpoints,v_numlayers,v_matdiameter,v_nozzlediameter,pointshape); //calculating extruding values
					gcode=createGcode(numpoints,v_iheight,v_layerheight, v_numlayers, v_feedrate,v_ExtValueBuildUpPressure,v_ExtValueReleasePressure,pointshape,e); //create variable string gcode	
				break;
									
				case 3:
					var numpoints=256; //number of points of ellipse
					drawAxis();	// instance to drawAxis	function
					processing.noFill(); // no fill shapes
					processing.stroke(0,0,255);   // stroke color RGB - blue
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
										
					//define ordered points for ellipse
					pointshape=calcEllipsePoints(numpoints, v_width, v_height);
										
					processing.ellipse(0,0,v_width,v_height); //drawing ellipse
					processing.popMatrix(); 
										
					orderedpoints=createOrderedPoints(numpoints,pointshape); //create variable string orderedpoints	
					pointshape=scalePointsToMaxDimension(numpoints,pointshape); //scaling points to max dimension of printer
					e=calculateExtrusionValues(numpoints,v_numlayers,v_matdiameter,v_nozzlediameter,pointshape); //calculating extruding values
					gcode=createGcode(numpoints,v_iheight,v_layerheight, v_numlayers, v_feedrate,v_ExtValueBuildUpPressure,v_ExtValueReleasePressure,pointshape,e); //create variable string gcode										
				break;
				
				case 4:
					var numpoints=v_pointsstar*2; //number of points of star
					drawAxis();	// instance to drawAxis	function
					processing.noFill(); // no fill shapes
					processing.stroke(0,0,255);   // stroke color RGB - blue
					processing.pushMatrix();	
					processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
										
					pointshape=star(0, 0, v_radius1, v_radius2,v_pointsstar);  //draw the star and define pointshape
					processing.popMatrix(); 
										
					orderedpoints=createOrderedPoints(numpoints,pointshape); //create variable string orderedpoints	
					pointshape=scalePointsToMaxDimension(numpoints,pointshape); //scaling points to max dimension of printer
					e=calculateExtrusionValues(numpoints,v_numlayers,v_matdiameter,v_nozzlediameter,pointshape); //calculating extruding values
					gcode=createGcode(numpoints,v_iheight,v_layerheight, v_numlayers, v_feedrate,v_ExtValueBuildUpPressure,v_ExtValueReleasePressure,pointshape,e); //create variable string gcode	
				break;		
		}	//end of switch structure	
		/*document.getElementById("displaylistpoints").innerHTML = orderedpoints; */
		document.getElementById("gcode").innerHTML = gcode;							
	};	//end of draw processing function								
} //end of function myprocess
					
var canvas = document.getElementById("micanvas"); 
var miInstanciaProcessing = new Processing(canvas, myprocess);
					
									
						

