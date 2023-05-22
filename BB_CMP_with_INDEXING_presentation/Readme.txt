BareBone compiler syntax:
-------------------------------------------
#Simple function (CLEAR, INCR, DECR, PRINT)
	<s_function> <variable>;
-------------------------------------------
#Copy function
	COPY <var> <number>
   or COPY <var1> <var2>   => Gán giá trị biến var1=var2
-------------------------------------------
#IF function:
	IF <var> NOT 0 
		THEN <functions>
		ELSE <functions>
	endif;
-------------------------------------------
#While function:
	WHILE <var> NOT 0 DO
		<functions>
	END;