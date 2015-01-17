def parse_top_file(file_name):
    top_file = open(file_name)
    processes = []
    for line in top_file:
        processes.append(parse_top_line(line))

def parse_top_line(line):
    elements = line.split()
    elements = remove_top_line_garbage(elements)
    ret = {}
    ret['pid'] = elements[0]
    ret['user'] = elements[1]
    ret['pr'] = elements[2]
    ret['ni'] = elements[3]
    ret['virt'] = elements[4]
    ret['res'] = elements[5]
    ret['shr'] = elements[6]
    ret['s'] = elements[7]
    ret['cpu'] = elements[8]
    ret['mem'] = elements[9]
    ret['time'] = elements[10]
    ret['command'] = elements[11]
    return ret

def remove_top_line_garbage(line_elements):
    line_elements.pop(0)
    line_elements.pop()
    return line_elements

parse_top_file('top.txt')

