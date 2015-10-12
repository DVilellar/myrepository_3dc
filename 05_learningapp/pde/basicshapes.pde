String optionselected, orderedpoints;
int v_width,v_height;
color c_blue,c_white,c_red;
 
void setup (){
  size(700,700); 
  stroke(0,0,0); 
  frameRate(15); 
  int posy=0;
  c_blue=color(0,0,255);
  c_white=color(255,255,255);
  c_red =color(255,0,0);
}//end of setup processing function  
              
void draw() {                
  int v_width = parseInt(document.getElementById("id_width").value);
  int v_height = parseInt(document.getElementById("id_height").value);
  String optionselected=document.getElementById("shapetodraw").value;
  orderedpoints="";  
  background(c_white);  
  fill(c_red); 
                switch(optionselected) {
                  
                  case "Square":
                    noFill();
                    stroke(c_blue); 
                    x1=30;
                    y1=30;  
                    x2=x1+v_width;
                    y2=y1;
                    x3=x1+v_width;
                    y3=y1+v_height;
                    x4=x1;
                    y4=y1+v_height;                    
                    orderedpoints=orderedpoints+ "("+x1+","+y1+")" +";" + "("+x2+","+y2+")"  +";" + "("+x3+","+y3+")" +";" + "("+x4+","+y4+")";
                    rect(x1,y1,v_width,v_height); 
                    
                    //text on canvas
                    text(x1+",",30,25);
                    text(y1,30+20,25);
                    text(x2+",",30+v_width,25);
                    text(y2,30+v_width+25,25);
                    text(x3+",",30+v_width,30+v_height+15);
                    text(y3,30+v_width+25,30+v_height+15);
                    text(x4+",",30,30+v_height+15);
                    text(y4,30+20,30+v_height+15);                    
                  break;
                  
                  case "Triangle":
                    noFill();
                    stroke(c_blue); 
                    x1=30;
                    y1=670;
                    x2=x1+(v_width/2);
                    y2=y1-v_height;
                    x3=v_width+x1;
                    y3=y1;
                    orderedpoints=orderedpoints+ "("+x1+","+y1+")" +";" + "("+x2+","+y2+")"  +";" + "("+x3+","+y3+")";
                    triangle(x1,y1,x2,y2,x3,y3);
                    
                    //text on canvas
                    text(x1+",",x1,y1+15);
                    text(y1,x1+20,y1+15);
                    text(x2+",",x2,y2);
                    text(y2,x2+25,y2);
                    text(x3+",",x3,y3+15);
                    text(y3,x3+25,y3+15);
                    
                  break;
                  
                  case "Circle":
                    noFill();
                    stroke(c_blue); 
                    ellipse(350,350,v_width,v_height);
                  break;                
                }             
 document.getElementById("displaylistpoints").innerHTML = orderedpoints;               
};  //end of draw processing function        

          
      