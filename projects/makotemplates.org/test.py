from mako.template import Template

template = Template(filename='test.mako')

rendered_template = template.render(name='tea.xyz')

print(rendered_template)
