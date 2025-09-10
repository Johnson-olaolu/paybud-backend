import path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

export const generateAvatar = () => {
  const names = [
    'Brooklynn',
    'Alexander',
    'George',
    'Robert',
    'Aiden',
    'Amaya',
    'Emery',
    'Kimberly',
    'Ryan',
    'Eden',
    'Jack',
    'Jameson',
    'Ryker',
    'Easton',
    'Vivian',
    'Mason',
    'Adrian',
    'Luis',
  ];
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${names[Math.floor(Math.random() * names.length)]}`;
};

export const generateEmailBody = (
  templateName: string,
  data: Record<string, any>,
): string => {
  const templatePath = path.join(
    __dirname,
    `./templates/email/${templateName}.hbs`,
  );
  const template = fs.readFileSync(templatePath, 'utf-8');
  const compiledTemplate = handlebars.compile(template);

  return compiledTemplate({ ...data });
};
