import path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

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
