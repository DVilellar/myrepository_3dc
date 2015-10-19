/*
 * Main program
 */ 

//Variables required
String optionselected, orderedpoints, gcode;
int n_selected, v_width,v_height,numpoints;
color c_blue,c_white,c_red,c_black,c_grey;
float [] x = new float[49000];
float [] y = new float[49000];

/*
*The setup() function is run once, when the program starts. 
*It's used to define initial enviroment properties such as screen size and to load media such as images and fonts as the program starts. 
*There can only be one setup() function for each program and it shouldn't be called again after its initial execution.
*/
void setup (){
  size(700,700);  //screen size
  frameRate(15);  //frames per second
  c_blue=color(0,0,255);       //initializing variable color RGB
  c_white=color(255,255,255);  //initializing variable color RGB
  c_red =color(255,0,0);       //initializing variable color RGB
  c_black = color(0,0,0);      //initializing variable color RGB
  c_grey =color(150,150,150);  //initializing variable color RGB    
}

           
void draw() {                
 
  /*obtain values from html form*/
  int v_width = parseInt(document.getElementById("id_width").value);
  int v_height = parseInt(document.getElementById("id_height").value);
  String optionselected=document.getElementById("shapetodraw").value;
   
  // initialiting variable n_selected
  if (optionselected == "Square") {n_selected=1;}
  if (optionselected == "Triangle") {n_selected=2;}
  if (optionselected == "Circle") {n_selected=3;}
  
   
  orderedpoints="";  //initializing variable string
  background(c_white);  //background color
  
  drawAxis();    //instance to function drawCoordinates
                switch(n_selected) {
                  
                  case 1:
                    int numpoints=4;
                    noFill();
                    stroke(c_blue);                     
                    pushMatrix();
                    translate (width/2,height/2);  
                    x[0]=-(v_width/2.0);
                    y[0]=-(v_height/2.0);  
                    x[1]=x[0]+v_width;
                    y[1]=y[0];
                    x[2]=x[0]+v_width;
                    y[2]=y[0]+v_height;
                    x[3]=x[0];
                    y[3]=y[0]+v_height;                    
                    createOrderedPoints(numpoints);
                    rect(x[0],y[0],v_width,v_height); 
                    scalePointsToMaxDimension(numpoints);
                    createGcode(numpoints);
                    popMatrix();                                
                  break;
                  
                  case 2:
                    numpoints=3;
                    noFill();
                    stroke(c_blue);                     
                    pushMatrix();
                    translate (width/2,height/2);    
                    x[0]=-(v_width/2.0);
                    y[0]=(v_height/2.0);
                    x[1]=x[0]+(v_width/2);
                    y[1]=y[0]-v_height;
                    x[2]=v_width+x[0];
                    y[2]=y[0];
                    createOrderedPoints(numpoints);
                    triangle(x[0],y[0],x[1],y[1],x[2],y[2]);
                    scalePointsToMaxDimension(numpoints);
                    createGcode(numpoints);
                    popMatrix();             
                  break;
                  
                  case 3:
                    numpoints=256; //number of points that we divide the ellipse
                    noFill();
                    stroke(c_blue); 
                    pushMatrix();
                    translate (width/2,height/2);  
                    calcEllipsePoints(numpoints,v_width,v_height);
                    createOrderedPoints(numpoints);
                    ellipse(0,0,v_width,v_height);
                    scalePointsToMaxDimension(numpoints);
                    createGcode(numpoints);
                    popMatrix();
                  break;                
                }             
document.getElementById("displaylistpoints").innerHTML = orderedpoints;  
document.getElementById("gcode").innerHTML = gcode;
};  //end of draw processing function        

/*
*This function drawAxis is to draw the axis in grey color
*/
void drawAxis(){
    stroke(c_grey); //stroke color
    fill(c_grey);  //fill color
    
    //drawing text for end of axis
    textSize(14);
    text("y-",350,15);
    text("y+",350,690);
    text("x+",680,350);
    text("x-",5,350);
    text("(0,0)",355,365);
    
    //drawing axis and arrows
    pushMatrix();
    translate (width/2,height/2); 
    ellipse(0, 0, 5, 5);
    line(0,0,325,0);
    triangle(325,0, 320, 5, 320, -5);
    rotate(PI/2.0);
    line(0,0,325,0);
    triangle(325,0, 320, 5, 320, -5);
    rotate(PI/2.0);
    line(0,0,325,0);
    triangle(325,0, 320, 5, 320, -5);
    rotate(PI/2.0);
    line(0,0,325,0);    
    triangle(325,0, 320, 5, 320, -5);
    popMatrix(); 
}

/*
*This function is to create the string called orderedpoints
*/
void createOrderedPoints(int n){
  orderedpoints="";  //initializing variable string
  for (int i = 0; i <= n-2; i = i+1) {
     orderedpoints=orderedpoints+ "("+x[i]+","+y[i]+")" +";";
  } 
   orderedpoints=orderedpoints+"("+x[n-1]+","+y[n-1]+")";
  
}

/*
*This function is to calculate the parametric points of an ellipse
*/ 
void calcEllipsePoints(int n_points, float c_width, float c_length){
 float a = c_width/2.0;
 float b = c_length/2.0;
 float rad=0.0;
 float inc = TWO_PI/n_points;
 for (int p_counter = 0; p_counter < n_points; p_counter = p_counter+1) {
   x[p_counter]=a*cos(rad);
   y[p_counter]=b*sin(rad);
   rad= rad + inc;   
 } 
} 

/*
*This function is to create the string called gcode following G-code language
*/
void createGcode(int n_points){
  int p_counter; 
  gcode=";gcode generated from basicshapes.pde\n";
  gcode=gcode+";developped by: David Vilella Riera\n";
  gcode=gcode+";THE CODE:\n";
  gcode=gcode+";Homing all axis\n";
  gcode=gcode+"G28\n";
  gcode=gcode+";Move to the first point to the lowest Z axis height (by default Z=0) and set the movement feedrate (by default we use 3000mm/min)\n";
  p_counter=0;
  gcode=gcode+"G1 X"+(x[p_counter])+" Y"+(y[p_counter])+" Z0 F3000\n";
  for ( p_counter = 1; p_counter < n_points; p_counter = p_counter+1) {
    gcode=gcode+";Move to the point "+(p_counter+1)+"\n";
    gcode=gcode+"G1 X"+(x[p_counter])+" Y"+(y[p_counter])+"\n";
  }
  gcode=gcode+";to close shape we need to go back to the first point\n";
  p_counter=0;
  gcode=gcode+"G1 X"+(x[p_counter])+" Y"+(y[p_counter])+"\n";
  gcode=gcode+";Disable motors command\n";
  gcode=gcode+"M84";
} 

 /*
*This function is to scale points to max dimension
*/
void  scalePointsToMaxDimension(int n_points){ 
  float big_axis=100.0; // it make reference that 100mmx100mm is the maximum area for printer
  float x_scale, y_scale;
    
  /*calculate maximum and minimum difference for each axis*/
  float xmax = x[0];
  float xmin = x[0];
  for (int i = 1; i <= n_points-1; i = i+1) {
    if (x[i]>xmax) {xmax=x[i];}
    if (x[i]<xmin) {xmin=x[i];}
  }
    
  float ymax = y[0];
  float ymin = y[0];
  for (int i = 1; i <= n_points-1; i = i+1) {
    if (y[i]>ymax) {ymax=y[i];}
    if (y[i]<ymin) {ymin=y[i];}
  }
  float x_difference=xmax-xmin;
  float y_difference=ymax-ymin;
    
  /*calculating x_scale and y_scale according to which difference is bigger*/
  if (y_difference>x_difference) {
    y_scale=big_axis/y_difference;
    x_scale=x_difference/y_difference*y_scale;
   }
  else {
    x_scale=big_axis/x_difference;
    y_scale=y_difference/x_difference*x_scale;
   }
  
  /*scaling points: we need to multiply each point value for its axis scale*/
  for (int i = 0; i <= n_points-1; i = i+1) {
    x[i]=x[i]*x_scale;
    y[i]=y[i]*y_scale;
  } 
}  
  
  
  
  
  
  
  
  
  