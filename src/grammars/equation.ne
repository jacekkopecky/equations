@builtin "number.ne"
@builtin "whitespace.ne"
@builtin "postprocessors.ne"

@{%
  function neg(o) {
    o.n = -o.n;
    return o;
  }
%}

equation -> _ add _ "=" _ add _    {% $({ lhs: 1, rhs: 5 }) %}

add      -> add _ "+" _ part       {% d => [...d[0], d[4]] %}
          | add _ "-" _ part       {% d => [...d[0], neg(d[4])] %}
          | part                   {% d => [d[0]] %}

part     -> N                      {% d => ({ n: d[0] }) %}
          | var                    {% d => ({ n: 1, var: d[0] }) %}
          | N _ "*" _ var          {% d => ({ n: d[0], var: d[4] }) %}
          | N _ var                {% d => ({ n: d[0], var: d[2] }) %}

var      -> [a-z]                  {% id %}

N        -> decimal                {% id %}
