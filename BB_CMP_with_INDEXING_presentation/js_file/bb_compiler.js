//Input code
code=" CLEAR a;\n INCR a; INCR a;"
//Tokenize--------------------------------------------------------
let numberOfLine=0;
tokenizePattern = (type, pattern, input, current) => {
  let char = input[current];
  let consumedChars = 0;
  if (pattern.test(char)) {
    let value = "";
    while (char && pattern.test(char)) {
      value += char;
      consumedChars ++;
      char = input[current + consumedChars];
    }
    value=value.toUpperCase();
    let line =numberOfLine;
    return [consumedChars , { type, value ,line}];
  }
  return [0, null]
}
//Recognize string token
tokenizeName = (input, current) => tokenizePattern("name", /[a-z]/i, input, current)

//Recognize number token
tokenizeNumber = (input, current) => tokenizePattern("number", /[0-9]/, input, current)

//Recognize semicolon token
tokenizeSemicolon = (input, current) => tokenizePattern("semicolon", /[;]/i, input, current)
//Delete white space
skipWhiteSpace = (input, current) =>   ((/\s/.test(input[current])) && (!(/\n/.test(input[current])))) ? [1, null] : [0, null]
countLine = (input, current) =>   {
  if(/\n/.test(input[current]))  {
    numberOfLine+=1;
    return [1, null];
  }
  else{
    return [0,null];
  }
}
console.log(code)
//Tokenizer function
tokenizers = [skipWhiteSpace, tokenizeNumber, tokenizeName, tokenizeSemicolon, countLine];
tokenizer = (input) => {
  numberOfLine=1;
  let current = 0;
  let tokens = [];
  if(input!=undefined){
    while (current < input.length) {
      let tokenized = false;
      tokenizers.forEach(tokenizer_fn => {
        if (tokenized) {return;}
        let [consumedChars, token] = tokenizer_fn(input, current);
        if(consumedChars !== 0) {
          tokenized = true;
          current += consumedChars;
        }
        if(token) {
          tokens.push(token);
        }
      });
      if (!tokenized) {
        throw new TypeError('I dont know what this character is: ' + char);
      }
    }
    return tokens;
  }
  else{
    return "";
  }
}
//console.log(tokenizer(code))

//Parser-------------------------------------------------------------------------------------

//List of function's name tokens
const all_stoken=["INCR","CLEAR","DECR","PRINT"];
const all_token=["INCR","CLEAR","DECR","END","IF","WHILE","NOT","DO", "COPY","THEN","ELSE"]
//Check a string is variable
function is_variable(token,line){
  error="\nIn line "+line +": Require a variable after function!"
  if(token==undefined){
      throw new TypeError(error);		
  }
  if(token.type!='name'|all_token.includes(token.value)){
    throw new TypeError(error);		
  }
}
//Check a string is semicolon
function is_semicolon(token,line){
  error="\nIn line "+ line +": Require  ';' at the end of function!"
  if(token==undefined)
    throw new TypeError(error);		
  if(token.type!='semicolon'){
    throw new TypeError(error);		
  }
}
//Check a string is number
function is_number(token,line){
  error="\nIn line "+line +": Require number at the end of function!"
  if(token==undefined)
    throw new TypeError(error);		
  if(token.type!='number'){
    throw new TypeError(error);		
  }
}
//Check strings are conditional
function is_condition(tokens,current){ 
  line=tokens[current].line;
  let token = tokens[current++];		
  is_variable(token,line);
  val=token.value;		
  token = tokens[current++];	
  if(token.value!="NOT"){
    throw new TypeError("\nIn line "+line +": Require NOT after condition instruction!");		
  }  		  
  token = tokens[current++];	
  if(token.value!='0'){
    if(token.value!="NOT"){
      throw new TypeError("\nIn line "+line +": Require '0' after condition instruction!");		
    } 
  }
  return [val,current];
}
//Parser number
parseNumber = (tokens, current) => {
  throw new TypeError("\nIn line "+tokens[current].line +": Constant "+tokens[current].value+" was founded!");    
}
//Parser variable
parseVariable=(tokens, current) => {
  throw new TypeError("\nIn line "+tokens[current].line +": Variable "+tokens[current].value+" was founded!");    
}
//Parser else and then token
parseELSE_THEN = (tokens, current) => {
  let node={
    type: 'Syntax',
    name:tokens[current++].value,
    val: "",
 }
 return [current,node];
}
//Parser a simple function <INCR, CLEAR, DECR, PRINT>
parseSimple_Funtion = (tokens, current)  => {
  line=tokens[current].line;		
  let token = tokens[current++];
  let node = {
    type: 'Function',
    name: token.value,
    val:'',
  };
  token = tokens[current++];		
  is_variable(token,line);
  node.val=token.value;
  is_semicolon(tokens[current++],line);
  return [current, node];
}
//Parser COPY function
parseCopy = (tokens, current)  => {
  line=tokens[current].line;	
  let token = tokens[current++];
  let node = {
    type: 'Function',
    name: token.value,
    val:'',
    val1:'',
  };	
  token=tokens[current++];					
  is_variable(token,line);
  node.val=(token.value);
  token=tokens[current++];	
  if(token.type!='number'){
    if(token.type!='name'|all_token.includes(token.value)){
      throw new TypeError("\nIn line "+line +": Require a variable at the end of function! ");		
    }
    else if(token.type=='name'){
      node.val1=token.value;
    }
    else
    throw new TypeError("\nIn line "+line +": Require a variable at the end of function!");		
  }
  else
      node.val1=Number(token.value);
  is_semicolon(tokens[current++],line);
  return [current, node];
}
//Parser WHILE function
count_while=0;
parserWHILE=(tokens, current)  => {
  line=tokens[current].line;
  let token = tokens[current++];
  let node = {
    type: 'LOOP',
    name: token.value,
    val:'',
    ordinal:count_while++,
  };
  [node.val,current]=is_condition(tokens,current);
  token = tokens[current++];	
  if(token.value!='DO'){
    throw new TypeError("\nIn line "+line +": Require DO after WHILE loop!");		
  }
  return [current, node];
}
//Parser IF function
parserCondition=(tokens, current)  => {
  line=tokens[current].line;
  let token = tokens[current++];
  let node = {
    type: 'Condition',
    name: token.value,
    val:'',
  };
  [node.val,current]=is_condition(tokens,current);
  token=tokens[current++]
  if(token==undefined)
    throw new TypeError("\nIn line "+line +": Require THEN after IF function!");		
  if(token.value!='THEN'){
    throw new TypeError("\nIn line "+line +": Require THEN after IF function!");		
  }
  return [current, node];
}
//Parser END token of WHILE function
parserEND=(tokens, current)  => {
  line=tokens[current].line;
  let token = tokens[current++];
  count_while=Math.max(0,count_while-1);
  let node = {
    type: 'END',
    name: token.value,
    ordinal:count_while,
  };	
  is_semicolon(tokens[current++],line);
  return [current, node];
}
parserENDIF=(tokens, current)  => {
  line=tokens[current];
  let token = tokens[current++];
  let node = {
    type: 'END',
    name: token.value,
  };	
  is_semicolon(tokens[current++],line);
  return [current, node];
}
//ParseToken function
parseToken = (tokens, current) => {
  let token = tokens[current];
  if (token.type === "number") {
    return parseNumber(tokens, current);
  }
  if(token.type==='name'&&all_stoken.includes(token.value)){
    return parseSimple_Funtion(tokens, current);
  }
  if(token.type==='name'&&token.value==="IF"){
    return parserCondition(tokens, current);
  }
  if(token.type==='name'&&(token.value==="END")){
    return parserEND(tokens, current);
  }
  if(token.type==='name'&&token.value==="ENDIF"){
    return parserENDIF(tokens, current);
  }
  if(token.type==='name'&&(token.value==="THEN"||token.value==="ELSE")){
    return parseELSE_THEN(tokens, current);
  }
  if(token.type==='name'&&token.value==="WHILE"){
    return parserWHILE(tokens, current);
  }
  if(token.type==='name'&&token.value==="COPY"){
    return parseCopy(tokens, current);
  }
  if(token.type==='name'){
    return parseVariable(tokens, current);
  }
  z=token.type;
  throw new TypeError(z);
}
//Build AST 
function parseProgram(input) {
  tokens=tokenizer(input);
  let current = 0;
  let ast = {
    type: 'Program',
    body: [],
    variables : new Map(),
    output:new Map(),
  };
  let node = null;
  if (tokens!=undefined)  {
  while (current < tokens.length) {
    [current, node] = parseToken(tokens, current);
    ast.body.push(node);
  }
  return ast;
 }
 else{
  return "";
}
}
//console.log(parseProgram(code))

//Compile-----------------------------------------------------------------------------------------
//Check a number's value is NaN
function check(a,v){
  if(isNaN(a)){
    throw new TypeError('Variable '+v+' was not defined!');
  }
  else
  return a;
}

//Solve function <input: a Barebone function in AST>
function f(ast,cur){
  let now=Date.now()/1000;
  if (now-start>5){
    throw new TypeError('Runtime error!');
  }
  a=(ast.body[cur++]);
  fun=a.name;
  v=a.val;
  switch (fun){
    case 'CLEAR':ast.variables.set(v,0); break;
    case 'INCR': ast.variables.set(v, check(ast.variables.get(v),v)+1);break;
    case 'DECR': ast.variables.set(v, Math.max(check(ast.variables.get(v),v)-1,0));break;
    case 'PRINT':ast.output.set(v,check(ast.variables.get(v),v));break;
    case 'COPY': 
    if(typeof a.val1=="number") 
      ast.variables.set(v,a.val1);
    else
    ast.variables.set(v,check(ast.variables.get(a.val1),a.val1));break;
    case 'IF':  
      if (ast.variables.get(v)==0){
        do{
          a=(ast.body[cur++]);
          current_instruction=a.name;
        }
        while(current_instruction!="ELSE");
        do{
          a=(ast.body[cur]);
          current_instruction=a.name;
          f(ast,cur++);
        }while(current_instruction!="ENDIF");
        break;
      }
      else{
        do{
          a=(ast.body[cur]);
          current_instruction=a.name;
          f(ast,cur++);
        }
        while(current_instruction!="ELSE");
        do{
          a=(ast.body[cur++]);
          current_instruction=a.name;
        }while(current_instruction!="ENDIF");
        break;
      }
    case 'WHILE': 
      w_ordinal=a.ordinal;  
      
      if (ast.variables.get(v)==0)
        {
          do{
            a=(ast.body[cur++]);
            fun=a.name;
            if(fun=="END"){
              e_ordinal=a.ordinal;
              if(w_ordinal===e_ordinal)
              return cur;
            }
          }while(true);
        }
      else{
        let id=cur-1;
        do{
          
          a=(ast.body[cur]);
          fun=a.name;
          v=a.val;
          if(fun==="END"){
            e_ordinal=a.ordinal;
            if((ast.body[id]).ordinal===e_ordinal){
              return id;
              }
          }
          cur=f(ast,cur);
        }while(true);
        }
        default : return cur;
      }
    return cur;
  }

//Compiler function 
function compiler(input){
  ast=parseProgram(input);
  let current = 0;
  if(ast!=undefined)
  {
    while(current<ast.body.length){
      current = f(ast,current);
    }
    return ast;
  }
  else{
    return "";
  }
}
let start
//console.log(compiler(code))

//Get the output value of the BareBone Program <print>
function get_Value(input){
  //numberOfLine=1;
  start=Date.now()/1000;
  ast=compiler(input);
  if(ast.output.size>0)
      map=ast.output;
  else 
    map=ast.variables;
  let i=0;
  to_string='';
  vals=(Array.from(map));
  while(i<vals.length){
    to_string+=vals[i][0]+ " = " +vals[i][1]+ ";  ";
    i++;
  }
  return to_string;
}
//console.log(get_Value(code))
