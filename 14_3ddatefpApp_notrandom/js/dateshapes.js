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
/*
*CLASS point
*/
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
function createGcode(pointshapeone,numpoints1,e1,pointshapetwo,numpoints2,e2,initialheight,layerheight,numlayers,feedrate,ExtValueBuildUpPressure,ExtValueReleasePressure){
 var gcode=";gcode generated from dateshapes.js\n";
 var actual_z=0;
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
  gcode=gcode+";Move to the first point of shape 1\n";
  var p_counter=0;
  actual_z=actual_z+initialheight;
  gcode=gcode+"G1 X"+pointshapeone[p_counter].x.toFixed(4)+" Y"+pointshapeone[p_counter].y.toFixed(4)+" Z"+actual_z+" F"+feedrate+"\n";
  gcode=gcode+";Build up pressure\n";
  gcode=gcode+"G1 E"+ExtValueBuildUpPressure+" F200\n";
  gcode=gcode+"G92 E0\n";
  gcode=gcode+"G1 F"+feedrate+"\n";
  var actual_ext=0;
    for (var layer_counter=1; layer_counter <= numlayers; layer_counter = layer_counter+1){
		var numbershape=1;
		
		gcode=gcode+";Moving to the layer number "+(layer_counter)+"\n";
		if (layer_counter > 1) {
		actual_z=actual_z+layerheight;
		
		}
		gcode=gcode+"G1 Z"+actual_z+"\n";
		if (layer_counter > 1){
		gcode=gcode+";Move to the first point ...................................\n";
		gcode=gcode+"G1 X"+pointshapeone[0].x.toFixed(4)+" Y"+pointshapeone[0].y.toFixed(4)+" E"+actual_ext.toFixed(6)+"\n";
		}	
		
		//1st shape
		for ( p_counter = 1; p_counter < numpoints1; p_counter = p_counter+1) {
			actual_ext=actual_ext+e1[p_counter-1];
			gcode=gcode+";Move to the point "+(p_counter+1)+" of shape "+numbershape+"\n";
			gcode=gcode+"G1 X"+pointshapeone[p_counter].x.toFixed(4)+" Y"+pointshapeone[p_counter].y.toFixed(4)+" E"+actual_ext.toFixed(6)+"\n"; 
		}	
			actual_ext=actual_ext+e1[numpoints1-1];
			gcode=gcode+";to close shape "+numbershape+" we need to go back to the first point\n";
			gcode=gcode+"G1 X"+pointshapeone[0].x.toFixed(4)+" Y"+pointshapeone[0].y.toFixed(4)+" E"+actual_ext.toFixed(6)+"\n"; 
		
		//2nd shape
		numbershape=numbershape+1; 
		for ( p_counter = 0; p_counter < numpoints2; p_counter = p_counter+1) {
			if(p_counter>0){
			actual_ext=actual_ext+e2[p_counter];
			}
			else
			{
			actual_ext=actual_ext
			}			
			gcode=gcode+";Move to the point "+(p_counter+1)+" of shape "+numbershape+"\n";
			gcode=gcode+"G1 X"+pointshapetwo[p_counter].x.toFixed(4)+" Y"+pointshapetwo[p_counter].y.toFixed(4)+" E"+actual_ext.toFixed(6)+"\n"; 			
		}	
			actual_ext=actual_ext+e2[numpoints2-1]	
			gcode=gcode+";to close shape "+numbershape+" we need to go back to the first point\n";
			gcode=gcode+"G1 X"+pointshapetwo[0].x.toFixed(4)+" Y"+pointshapetwo[0].y.toFixed(4)+" E"+actual_ext.toFixed(6)+"\n"; 	
	  } //end of layer for
	gcode=gcode+";Release pressure\n";
	actual_ext=actual_ext-ExtValueReleasePressure;
	gcode=gcode+"G1 E"+actual_ext.toFixed(6)+" F200\n";
    gcode=gcode+";Set up the feedrate\n";
	gcode=gcode+"G1 F"+feedrate+"\n";
	gcode=gcode+";Homing all axis\n";
	gcode=gcode+"G28\n";  
	gcode=gcode+";Disable motors command\n";
	gcode=gcode+"M84";  
 return gcode;
}
/*
*This function is to create the string called orderedpoints
*/
function createOrderedPoints(n,pointshape){
  var orderedpoints="";  //initializing variable string
  for (var i = 0; i < n; i = i+1) {
     orderedpoints=orderedpoints+ "("+pointshape[i].x.toFixed(4)+","+pointshape[i].y.toFixed(4)+")" +";";
  }   
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
  for (i = 0; i < n_points; i = i+1) {
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
*This function is to calculate the extrusion increase values for gcode
*/ 
function createextrusionincrementvalues(d,numpoints,v_matdiameter,v_nozzlediameter){

	var e = new Array;

	/*Calculating nozzle_material_surfaces_ratio*/	
	var v_materialsurface=Math.PI*Math.pow((v_matdiameter/2.0),2);
	var v_nozzlesurface=Math.PI*Math.pow((v_nozzlediameter/2.0),2);
	var nozzle_material_surfaces_ratio=v_nozzlesurface/v_materialsurface;
	
	for (var p_counter = 0; p_counter < numpoints; p_counter = p_counter+1) {
		e[p_counter]=d[p_counter]*nozzle_material_surfaces_ratio 
	}
	return e;
}
/*
*This function is to calculate the distances values of points of a shape
*/ 
function createdistancesarray (numpoints,pointshape){
	var d1 = new Array;
	for (var i = 0; i < numpoints-1; i = i+1) {
	d1[i]=Math.sqrt(Math.pow((pointshape[i].x-pointshape[i+1].x),2)+Math.pow((pointshape[i].y-pointshape[i+1].y),2));
	}
	d1[numpoints-1]=Math.sqrt(Math.pow((pointshape[numpoints-1].x-pointshape[0].x),2)+Math.pow(((pointshape[numpoints-1].y-pointshape[0].y)),2));
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
var posYbutton1 =150;
var Diam_button1=200;	
var e1 = new Array;	
var e2 = new Array;	
var d1 = new Array;	
var d2 = new Array;			
var numpoints1;
var numpoints2;
var totalpoints;
var gcodetext;

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
		
		processing.frameRate(15);  //frames per second that function draw will run					
		buttonclickhere = processing.loadImage ("data/buttonclickhere.png");		
	}	
	/*
	*The draw() function is executed it depends of de frameRate on setup function
	*/						
	processing.draw = function() {							
		/*defined screen size variables*/
		var sizescreenx = 960;
		var sizescreeny = 700;
		var orderedpoints="";  //initializing variable string
		/*
		*Below two functions onCircle and update1 exist to simulate that the button click here when mouse is over moves 
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
				processing.image (buttonclickhere, 2, 2);	
			}  		 	
		}
		/*
		*This function is to draw a rectangle and return an array with their points
		*/
		function drawrectangle(v_width,v_height){
			var pointshape = new Array;
			processing.pushMatrix();
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			pointshape[0] = new point (-(v_width/2.0),-(v_height/2.0));
			pointshape[1] = new point (pointshape[0].x+v_width,pointshape[0].y);											
			pointshape[2] = new point (pointshape[0].x+v_width,pointshape[0].y+v_height);
			pointshape[3] = new point (pointshape[0].x,pointshape[0].y+v_height);
			processing.rect(pointshape[0].x,pointshape[0].y,v_width,v_height); //drawing rectangle
			processing.popMatrix(); 
			return pointshape;
		}	
		/*
		*This function is to draw a triangle and return an array with their points
		*/
		function drawtriangle(v_width,v_height){
			var pointshape = new Array;
			processing.pushMatrix();	
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			pointshape[0] = new point (-(v_width/2.0),(v_height/2.0));
			pointshape[1] = new point (pointshape[0].x+(v_width/2),pointshape[0].y-v_height);
			pointshape[2] = new point (v_width+pointshape[0].x,pointshape[0].y);
			processing.triangle(pointshape[0].x,pointshape[0].y,pointshape[1].x,pointshape[1].y,pointshape[2].x,pointshape[2].y);//drawing triangle
			processing.popMatrix(); 
			return pointshape;
		}
		/*
		*This function is to draw a ellipse and return an array with their points
		*/		
		function drawellipse(numpoints,v_width,v_height){
			var pointshape = new Array;
			processing.pushMatrix();	
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			pointshape=calcEllipsePoints(numpoints, v_width, v_height);
			processing.ellipse(0,0,v_width,v_height); //drawing ellipse
			processing.popMatrix(); 
			return pointshape;	
			}			
		/*
		*This function is to create a shape as a star and define their points
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
		*This function is draw a star and define their points
		*/
		function drawstar(star_radius1, star_radius2,v_pointsstar){
			var pointshape = new Array;
			processing.pushMatrix();	
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			pointshape=star(0, 0, star_radius1, star_radius2,v_pointsstar);  //draw the star and define pointshape
			processing.popMatrix();
			return pointshape;	
		}	
		/*
		*This function is to create a shape as a flower and define their points
		*/
		function flower(radius1, radius2,npoints) {			
			var pointshape = new Array;		//array of points	
			var rad=0.0;
			var inc = 2*Math.PI/npoints;
			processing.beginShape();
			for (p_counter = 0; p_counter < npoints; p_counter = p_counter+1) {
					var sx = ((radius1+radius2)*Math.cos(rad))-(radius2 *Math.cos(((radius1+radius2)/radius2)*rad));
					var sy = ((radius1+radius2)*Math.sin(rad))-(radius2 *Math.sin(((radius1+radius2)/radius2)*rad));
					processing.vertex(sx, sy);
					pointshape[p_counter] = new point (sx,sy);
					rad= rad + inc;   
			}
			processing.endShape(processing.CLOSE);  		
			return  pointshape; 
		}	
		/*
		*This function is to draw a flower and define their points
		*/		
		function drawflower(numpoints,flower_radius1,v_npetalsflower){
			var pointshape = new Array;
			processing.pushMatrix();	
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			var flower_radius2=flower_radius1/v_npetalsflower;	
			pointshape=flower(flower_radius1,flower_radius2,numpoints);  //draw the flower and define pointshape
			processing.popMatrix();	
			return pointshape;
		}	
		/*
		*This function is to create a shape as a rounded star and define their points
		*/
		function roundedstar(radius1, radius2,npoints) {
			var pointshape = new Array;		//array of points	
			var rad=0.0;
			var inc = 2*Math.PI/npoints;
			processing.beginShape();
			for (p_counter = 0; p_counter < npoints; p_counter = p_counter+1) {
					var sx = ((radius1-radius2)*Math.cos(rad))+(radius2 *Math.cos(((radius1-radius2)/radius2)*rad));
					var sy = ((radius1-radius2)*Math.sin(rad))-(radius2 *Math.sin(((radius1-radius2)/radius2)*rad));
					processing.vertex(sx, sy);
					pointshape[p_counter] = new point (sx,sy);
					rad= rad + inc;   
			}
			processing.endShape(processing.CLOSE);  
			return  pointshape; 
		}	
		/*
		*This function is to is to draw a rounded star and define their points
		*/		
		function drawroundedstar(numpoints,roundedstar_radius1,v_ncurvesroundedstar){
			var pointshape = new Array;
			processing.pushMatrix();	
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			if (v_ncurvesroundedstar<=2) {v_ncurvesroundedstar=3}
			var roundedstar_radius2=roundedstar_radius1/v_ncurvesroundedstar;	
			pointshape=roundedstar(roundedstar_radius1,roundedstar_radius2,numpoints);  //draw the rounded star and define pointshape
			processing.popMatrix(); 
			return pointshape;
		}				
		/*
		*This function is to create a shape as a heart and define their points
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
		*This function is to draw a heart and define their points
		*/		
		function drawheart (v_sizeheart,numpoints){
			var pointshape = new Array;
			processing.pushMatrix();	
			processing.translate (sizescreenx/2,sizescreeny/2);  //translate coordinates to the middle of screen
			processing.rotate(Math.PI); //rotate coordinates 180 degrees
			pointshape=heart(16*v_sizeheart,13*v_sizeheart,5*v_sizeheart,2*v_sizeheart,1*v_sizeheart,numpoints);  //draw the heart and define pointshape, numbers are fixed with formula on wolfram mathworld.com
			processing.popMatrix(); 
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
			
			var sizescreenx = 960;
			var sizescreeny = 300;
			processing.size(sizescreenx,sizescreeny);  //screen size
			
			
			/*drawing background colour on frame 1*/
			processing.background(198,198,198);
			processing.image (buttonclickhere, 0, 0); 
			/*processing.image (imgtext3, 0, 0); */		
			update1(processing.mouseX, processing.mouseY); //to simulate that you are over "click here" button  		
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
			
			var sizescreenx = 960;
			var sizescreeny = 650;
			processing.size(sizescreenx,sizescreeny);  //screen size			
			
			/*drawing background colour on frame 2*/
			processing.background(198,198,198);
						
			/*show variables from birthday date*/
			processing.fill(138,5,27);
			processing.textAlign(processing.LEFT);
			processing.textSize(20);
			processing.text(day+"/"+month+"/"+year,15,25);	// background color RGB	
			processing.textSize(12);
			
			
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
			
			/* to obtain the addition of year digits */
			processing.textSize(12);
			var stringyear = year.toString(); 
			var numbers = stringyear.split("");
			var sumdigitnumbers=0;
			for (var i=0; i<4; i=i+1)
			{
			var g=parseInt(numbers[i]);
			sumdigitnumbers=sumdigitnumbers+g;
			}
			/* end of obtain the addition of year digits */	
			
			/*Selection of shape 1 (outside) from month*/
			if (numbers[3]%2==0 & numbers[0]==1){
				switch(month) {
					case 1: var n_selected1=3; break;
					case 2: var n_selected1=4; break;
					case 3: var n_selected1=5; break;
					case 4: var n_selected1=1; break;
					case 5: var n_selected1=2; break;
					case 6: var n_selected1=3; break;
					case 7: var n_selected1=4; break;
					case 8: var n_selected1=5; break;
					case 9: var n_selected1=1; break;
					case 10: var n_selected1=2; break;
					case 11: var n_selected1=3; break;
					case 12: var n_selected1=4; break;
				}
			}
			if (numbers[3]%2==0 & numbers[0]>1){
				switch(month) {
					case 1: var n_selected1=2; break;
					case 2: var n_selected1=3; break;
					case 3: var n_selected1=4; break;
					case 4: var n_selected1=5; break;
					case 5: var n_selected1=1; break;
					case 6: var n_selected1=2; break;
					case 7: var n_selected1=3; break;
					case 8: var n_selected1=4; break;
					case 9: var n_selected1=5; break;
					case 10: var n_selected1=1; break;
					case 11: var n_selected1=2; break;
					case 12: var n_selected1=3; break;
				}
			}
			if (numbers[3]%2!=0 & numbers[0]==1){
				switch(month) {
					case 1: var n_selected1=4; break;
					case 2: var n_selected1=5; break;
					case 3: var n_selected1=1; break;
					case 4: var n_selected1=2; break;
					case 5: var n_selected1=3; break;
					case 6: var n_selected1=4; break;
					case 7: var n_selected1=5; break;
					case 8: var n_selected1=1; break;
					case 9: var n_selected1=2; break;
					case 10: var n_selected1=3; break;
					case 11: var n_selected1=4; break;
					case 12: var n_selected1=5; break;
				}
			}
			if (numbers[3]%2!=0 & numbers[0]>1){
				switch(month) {
					case 1: var n_selected1=5; break;
					case 2: var n_selected1=1; break;
					case 3: var n_selected1=2; break;
					case 4: var n_selected1=3; break;
					case 5: var n_selected1=4; break;
					case 6: var n_selected1=5; break;
					case 7: var n_selected1=1; break;
					case 8: var n_selected1=2; break;
					case 9: var n_selected1=3; break;
					case 10: var n_selected1=4; break;
					case 11: var n_selected1=5; break;
					case 12: var n_selected1=1; break;
				}
			}
			/*parameters v_width and v_height for rectangles and elipses of shape 1 (outside)*/
			var v_width = parseInt(550); 
			if (sumdigitnumbers%2==0)
			{ var v_height=parseInt(v_width);}
			else
			{ var v_height=parseInt(0.9*v_width);}	
			/*end parameters v_width and v_height for rectangles and elipses of shape 1 (outside)*/
			
			/*parameters for flowers of shape 1 (outside)*/
			var flower_radius1 = 262;
			var v_npetalsflower;	
			if (sumdigitnumbers==1) {v_npetalsflower=5;}
			if (sumdigitnumbers==2) {v_npetalsflower=36;}
			if (sumdigitnumbers==3) {v_npetalsflower=9;}
			if (sumdigitnumbers==4) {v_npetalsflower=27;}
			if (sumdigitnumbers==5) {v_npetalsflower=18;}
			if (sumdigitnumbers==6) {v_npetalsflower=6;}
			if (sumdigitnumbers==7) {v_npetalsflower=35;}
			if (sumdigitnumbers==8) {v_npetalsflower=10;}
			if (sumdigitnumbers==9) {v_npetalsflower=26;}
			if (sumdigitnumbers==10) {v_npetalsflower=19;}
			if (sumdigitnumbers==11) {v_npetalsflower=7;}
			if (sumdigitnumbers==12) {v_npetalsflower=34;}
			if (sumdigitnumbers==13) {v_npetalsflower=11;}
			if (sumdigitnumbers==14) {v_npetalsflower=25;}
			if (sumdigitnumbers==15) {v_npetalsflower=20;}
			if (sumdigitnumbers==16) {v_npetalsflower=8;}
			if (sumdigitnumbers==17) {v_npetalsflower=33;}
			if (sumdigitnumbers==18) {v_npetalsflower=12;}
			if (sumdigitnumbers==19) {v_npetalsflower=24;}
			if (sumdigitnumbers==20) {v_npetalsflower=21;}
			if (sumdigitnumbers==21) {v_npetalsflower=9;}
			if (sumdigitnumbers==22) {v_npetalsflower=32;}
			if (sumdigitnumbers==23) {v_npetalsflower=13;}
			if (sumdigitnumbers==24) {v_npetalsflower=23;}
			if (sumdigitnumbers==25) {v_npetalsflower=22;}
			if (sumdigitnumbers==26) {v_npetalsflower=10;}
			if (sumdigitnumbers==27) {v_npetalsflower=31;}
			if (sumdigitnumbers==28) {v_npetalsflower=14;}
			if (sumdigitnumbers==29) {v_npetalsflower=22;}
			if (sumdigitnumbers==30) {v_npetalsflower=23;}
			if (sumdigitnumbers==31) {v_npetalsflower=11;}
			if (sumdigitnumbers==32) {v_npetalsflower=30;}
			if (sumdigitnumbers==33) {v_npetalsflower=15;}
			if (sumdigitnumbers==34) {v_npetalsflower=21;}
			if (sumdigitnumbers==35) {v_npetalsflower=24;}
			if (sumdigitnumbers==36) {v_npetalsflower=12;}
			/*end parameters for flowers of shape 1 (outside)*/
			
			/*parameters for rounded stars of shape 1 (outside)*/
			var roundedstar_radius1 = 275;
			var v_ncurvesroundedstar
			var v_ncurvesroundedstar=v_npetalsflower;	
			/*end of parameters for rounded stars of shape 1 (outside)*/
			
			/*parameters for stars of shape 1 (outside)*/
			var star_radius1_shapeone = parseInt(processing.random(260,260));
			var star_radius2_shapeone = parseInt(processing.random(304,304));			
			if (sumdigitnumbers>18){
			var v_pointsstar_shapeone = parseInt(processing.random(sumdigitnumbers,sumdigitnumbers));	
			}
			else 
			{
			var v_pointsstar_shapeone = parseInt(processing.random(25,25));
			}			
			/*end parameters for stars of shape 1 (outside)*/
			
			processing.noFill(); // no fill shapes
			processing.strokeWeight(3);  // Thicker
			processing.stroke(138,5,27);   // stroke color RGB 
			switch(n_selected1) {
				case 1: /*RECTANGLE*/
					numpoints1=4;
					var pointshape1 = new Array;		//array of points
					pointshape1=drawrectangle(v_width,v_height);	
				break;									
				case 2: /*ELLIPSE*/
					numpoints1=256; //number of points of ellipse
					var pointshape1 = new Array;		//array of points
					pointshape1=drawellipse(numpoints1,v_width,v_height);												
				break;				
				case 3: /*STAR*/					
					numpoints1=v_pointsstar_shapeone*2; //number of points of star
					var pointshape1 = new Array;		//array of points
					pointshape1=drawstar(star_radius1_shapeone, star_radius2_shapeone,v_pointsstar_shapeone);					
				break;				
				case 4: /*FLOWER*/
					numpoints1=360; //number of points of flower
					var pointshape1 = new Array;		//array of points
					pointshape1=drawflower(numpoints1,flower_radius1,v_npetalsflower);				
				break;						
				case 5: /*ROUNDED STAR*/
					numpoints1=360; //number of points of rounded star
					var pointshape1 = new Array;		//array of points
					pointshape1=drawroundedstar(numpoints1,roundedstar_radius1,v_ncurvesroundedstar);					
				break;					
		}// END OF SWITCH 1 FIRST SHAPE*********************************************************************************************************************************************
			totalpoints=totalpoints+numpoints1;
			var n_selected2;
			/*Selection of shape 2 (inside) from day*/
			if (numbers[2]%2==0 & numbers[3]%2!=0){
				switch(day) {
					case 1: n_selected2=4; break;
					case 2: n_selected2=5; break;
					case 3: n_selected2=6; break;
					case 4: n_selected2=7; break;
					case 5: 
						n_selected2=1; 
						if (n_selected2==n_selected1) {n_selected2=4;}	 //to avoid 2 squares as shapes			
					break;
					case 6: n_selected2=2; break;
					case 7: 
						n_selected2=3; 
						if (n_selected1==2) {n_selected2=4;}	 //to avoid 2 ellipses as shapes	
					break;
					case 8: n_selected2=4; break;
					case 9: n_selected2=5; break;
					case 10: n_selected2=6; break;
					case 11: n_selected2=7; break;
					case 12:
						n_selected2=1;
						if (n_selected2==n_selected1) {n_selected2=5;} //to avoid 2 squares as shapes		
					break;
					case 13: n_selected2=2; break;
					case 14: 
						n_selected2=3; 
						if (n_selected1==2) {n_selected2=5;}	 //to avoid 2 ellipses as shapes
					break;
					case 15: n_selected2=4; break;
					case 16: n_selected2=5; break;
					case 17: n_selected2=6; break;
					case 18: n_selected2=7; break;
					case 19: 
						n_selected2=1;
						if (n_selected2==n_selected1) {n_selected2=6;} //to avoid 2 squares as shapes						
					break;
					case 20: n_selected2=2; break;
					case 21: 
						n_selected2=3; 
						if (n_selected1==2) {n_selected2=6;}	 //to avoid 2 ellipses as shapes
					break;
					case 22: n_selected2=4; break;
					case 23: n_selected2=5; break;
					case 24: n_selected2=6; break;
					case 25: n_selected2=7; break;
					case 26:
						n_selected2=1; 
						if (n_selected2==n_selected1) {n_selected2=7;} //to avoid 2 squares as shapes	
					break;
					case 27: n_selected2=2; break;
					case 28:
						n_selected2=3; 
						if (n_selected1==2) {n_selected2=7;}	 //to avoid 2 ellipses as shapes
					break;
					case 29: n_selected2=4; break;
					case 30: n_selected2=5; break;
					case 31: n_selected2=6; break;
				}
			}
			
			if (numbers[2]%2==0 & numbers[3]%2==0){
				switch(day) {
					case 1: n_selected2=7; break;
					case 2: n_selected2=6; break;
					case 3: n_selected2=5; break;
					case 4: n_selected2=4; break;
					case 5: n_selected2=3; break;
					case 6: n_selected2=2; break;
					case 7: n_selected2=1; break;
					case 8: n_selected2=7; break;
					case 9: n_selected2=6; break;
					case 10: n_selected2=5; break;
					case 11: n_selected2=4; break;
					case 12: n_selected2=3; break;
					case 13: n_selected2=2; break;
					case 14: n_selected2=1; break;
					case 15: n_selected2=7; break;
					case 16: n_selected2=6; break;
					case 17: n_selected2=5; break;
					case 18: n_selected2=4; break;
					case 19: n_selected2=3; break;
					case 20: n_selected2=2; break;
					case 21: n_selected2=1; break;
					case 22: n_selected2=7; break;
					case 23: n_selected2=6; break;
					case 24: n_selected2=5; break;
					case 25: n_selected2=4; break;
					case 26: n_selected2=3; break;
					case 27: n_selected2=2; break;
					case 28: n_selected2=1; break;
					case 29: n_selected2=7; break;
					case 30: n_selected2=6; break;
					case 31: n_selected2=5; break;					
					}
				}
				
			if (numbers[2]%2!=0 & numbers[3]%2==0){
				switch(day) {
					case 1: n_selected2=1; break;
					case 2: n_selected2=3; break;
					case 3: n_selected2=5; break;
					case 4: n_selected2=7; break;
					case 5: n_selected2=2; break;
					case 6: n_selected2=4; break;
					case 7: n_selected2=6; break;
					case 8: n_selected2=1; break;
					case 9: n_selected2=3; break;
					case 10: n_selected2=5; break;
					case 11: n_selected2=7; break;
					case 12: n_selected2=2; break;
					case 13: n_selected2=4; break;
					case 14: n_selected2=6; break;
					case 15: n_selected2=1; break;
					case 16: n_selected2=3; break;
					case 17: n_selected2=5; break;
					case 18: n_selected2=7; break;
					case 19: n_selected2=2; break;
					case 20: n_selected2=4; break;
					case 21: n_selected2=6; break;
					case 22: n_selected2=1; break;
					case 23: n_selected2=3; break;
					case 24: n_selected2=5; break;
					case 25: n_selected2=7; break;
					case 26: n_selected2=2; break;
					case 27: n_selected2=4; break;
					case 28: n_selected2=6; break;
					case 29: n_selected2=1; break;
					case 30: n_selected2=3; break;
					case 31: n_selected2=5; break;					
					}
				}
				if (numbers[2]%2!=0 & numbers[3]%2!=0){
				switch(day) {
					case 1: n_selected2=1; break;
					case 2: n_selected2=5; break;
					case 3: n_selected2=2; break;
					case 4: n_selected2=3; break;
					case 5: n_selected2=6; break;
					case 6: n_selected2=4; break;
					case 7: n_selected2=7; break;
					case 8: n_selected2=1; break;
					case 9: n_selected2=5; break;
					case 10: n_selected2=2; break;
					case 11: n_selected2=3; break;
					case 12: n_selected2=6; break;
					case 13: n_selected2=4; break;
					case 14: n_selected2=7; break;
					case 15: n_selected2=1; break;
					case 16: n_selected2=5; break;
					case 17: n_selected2=2; break;
					case 18: n_selected2=3; break;
					case 19: n_selected2=6; break;
					case 20: n_selected2=4; break;
					case 21: n_selected2=7; break;
					case 22: n_selected2=1; break;
					case 23: n_selected2=5; break;
					case 24: n_selected2=2; break;
					case 25: n_selected2=3; break;
					case 26: n_selected2=6; break;
					case 27: n_selected2=4; break;
					case 28: n_selected2=7; break;
					case 29: n_selected2=1; break;
					case 30: n_selected2=5; break;
					case 31: n_selected2=2; break;					
					}
				}
				
			/*PARAMETERS OF SHAPE 2 (inside)********************************************************************/			
			/*parameters v_width and v_height for rectangles triangles and elipses of shape 2 (inside)*/
			var v_width = parseInt(350); 
			if (numbers[3]%2==0)
			{ var v_height=parseInt(v_width);}
			else
			{ var v_height=parseInt(0.9*v_width);}
			/*end of parameters v_width and v_height for rectangles triangles and elipses*/
			
			/*parameters for star of shape 2 (inside)*/
			var star_radius1 = parseInt(processing.random(125,125));
			var star_radius2 = parseInt(processing.random(190,190));				
			var v_pointsstar2 = parseInt(processing.random(8,9));
			
			/*parameters for flower of shape 2 (inside)*/			
			var flower_radius1 = 180;
			if (sumdigitnumbers==1) {var v_npetalsflower2 = 6;}
			if (sumdigitnumbers==2) {var v_npetalsflower2 = 7;}
			if (sumdigitnumbers==3) {var v_npetalsflower2 = 8;}
			if (sumdigitnumbers==4) {var v_npetalsflower2 = 9;}	
			if (sumdigitnumbers>=5) {var v_npetalsflower2 = sumdigitnumbers;}	
		
			/*parameters for roundedstar of shape 2 (inside)*/
			var roundedstar_radius1 = 175;			
			if (sumdigitnumbers<=5) {var v_ncurvesroundedstar2=6;}
			if (sumdigitnumbers>=6 & sumdigitnumbers<=10 ) {var v_ncurvesroundedstar2=7;}
			if (sumdigitnumbers>=11 & sumdigitnumbers<=15 ) {var v_ncurvesroundedstar2=8;}
			if (sumdigitnumbers>=16 & sumdigitnumbers<=20 ) {var v_ncurvesroundedstar2=9;}
			if (sumdigitnumbers>=21 & sumdigitnumbers<=25 ) {var v_ncurvesroundedstar2=10;}
			if (sumdigitnumbers>=26 & sumdigitnumbers<=30 ) {var v_ncurvesroundedstar2=11;}
			if (sumdigitnumbers>=31 & sumdigitnumbers<=36 ) {var v_ncurvesroundedstar2=12;}
			
			/*parameters for heart of shape 2 (inside)*/
			if (numbers[0]%2==0 & numbers[2]%2==0) { var v_sizeheart2=10 }
			if (numbers[0]%2==0 & numbers[2]%2!=0) { var v_sizeheart2=11 }
			if (numbers[0]%2!=0 & numbers[2]%2==0) { var v_sizeheart2=13 }
			if (numbers[0]%2!=0 & numbers[2]%2!=0) { var v_sizeheart2=15 }
			
			
			processing.noFill(); // no fill shapes
			processing.strokeWeight(3);  // Thicker
			processing.stroke(138,5,27);   // stroke color RGB 
			switch(n_selected2) {
				case 1: /*RECTANGLE*/
					numpoints2=4;
					var pointshape2 = new Array;		//array of points
					pointshape2=drawrectangle(v_width,v_height);										
				break;									
				case 2: /*TRIANGLE*/
					numpoints2=3;
					var pointshape2 = new Array;		//array of points
					pointshape2=drawtriangle(v_width,v_height);										
				break;									
				case 3: /*ELLIPSE*/
					numpoints2=256; //number of points of ellipse
					var pointshape2 = new Array;		//array of points
					pointshape2=drawellipse(numpoints2,v_width,v_height);					
				break;				
				case 4: /*STAR*/
					numpoints2=parseInt(v_pointsstar2*2); //number of points of star
					var pointshape2 = new Array;		//array of points
					pointshape2=drawstar(star_radius1, star_radius2,v_pointsstar2);					
				break;				
				case 5: /*FLOWER*/
					numpoints2=360; //number of points of flower
					var pointshape2 = new Array;		//array of points
					pointshape2=drawflower(numpoints2,flower_radius1,v_npetalsflower);										
				break;					
				case 6: /*ROUNDED STAR*/
					numpoints2=360; //number of points of rounded star
					var pointshape2 = new Array;		//array of points
					pointshape2=drawroundedstar(numpoints2,roundedstar_radius1,v_ncurvesroundedstar);					
				break;				
				case 7: /*HEART*/
					numpoints2=360; //number of points of heart
					var pointshape2 = new Array;		//array of points
					pointshape2=drawheart(v_sizeheart2,numpoints2);					
				break;	
				
		}// END OF SWITCH 2 SECOND SHAPE **************************************************************************************************************************************
				totalpoints=totalpoints+numpoints2;
				totalpointshape=pointshape1.concat(pointshape2); //concat the two pointshapes
				
				processing.fill(0,0,0);				
				totalpointshape=scalePointsToMaxDimension(totalpoints,totalpointshape); //SCALING POINTS TO MAX DIMENSION
				
				var pointshapeone = totalpointshape.slice(0, numpoints1); 				//obtaining points of shape one scaled
				var pointshapetwo = totalpointshape.slice(numpoints1, totalpoints+1); 	//obtaining points of shape two scaled
												
				var d1=createdistancesarray(numpoints1,pointshapeone); //CREATING ARRAY d1 OF DISTANCES BETWEEN POINTS OF SHAPE 1
				var d2=createdistancesarray(numpoints2,pointshapetwo); //CREATING ARRAY d2 OF DISTANCES BETWEEN POINTS OF SHAPE 2
								
				var e1=createextrusionincrementvalues(d1,numpoints1,v_matdiameter,v_nozzlediameter); //CREATING ARRAY e1 OF EXTRUSION INCREMENT OF SHAPE 1 
				var e2=createextrusionincrementvalues(d2,numpoints2,v_matdiameter,v_nozzlediameter); //CREATING ARRAY e2 OF EXTRUSION INCREMENT OF SHAPE 2 
				
				gcodetext="";
				gcodetext=createGcode(pointshapeone,numpoints1,e1,pointshapetwo,numpoints2,e2,v_iheight,v_layerheight,v_numlayers,v_feedrate,v_ExtValueBuildUpPressure,v_ExtValueReleasePressure); //CREATING STRING gcodetext
				
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
		document.getElementById("gcode").innerHTML = gcodetext;							
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
					
									
						

