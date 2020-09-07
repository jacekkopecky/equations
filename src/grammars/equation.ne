# this parses a linear equation
#
# parses an equation into an object:
# {
#   lhs: [ items on left-hand side ],
#   rhs: [ items on right-hand side ]
# }
#
# every item is an object:
# {
#   n: number,
#   var: string // optional, if not present the item is a constant
# }
#
# For example, "a - 2b = 3" parses into
# {
#   lhs: [
#     { n: 1, var: 'a' },
#     { n: -2, var: 'b' }
#   ],
#   rhs: [
#     { n: 3 }
#   ]
# }
#
# variables are lowercase, single-letter
# the '*' sign for multiplication is allowed but not required
# unary '-' is also allowed

@builtin "number.ne"
@builtin "whitespace.ne"
@builtin "postprocessors.ne"

@{%
  function neg(o) {
    o.n = -o.n;
    return o;
  }
%}

# equation
equation -> _ add _ "=" _ add _    {% $({ lhs: 1, rhs: 5 }) %}

add      -> add _ "+" _ part       {% d => [...d[0], d[4]] %}
          | add _ "-" _ part       {% d => [...d[0], neg(d[4])] %}
          | part                   {% d => [d[0]] %}

part     -> N                      {% d => ({ n: d[0] }) %}
          | var                    {% d => ({ n: 1, var: d[0] }) %}
          | "-" var                {% d => ({ n: -1, var: d[1] }) %}
          | N _ "*" _ var          {% d => ({ n: d[0], var: d[4] }) %}
          | N _ var                {% d => ({ n: d[0], var: d[2] }) %}

var      -> [a-z]                  {% id %}

N        -> decimal                {% id %}
