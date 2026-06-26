import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Reservar' }).click();
  await page.getByRole('combobox').selectOption('9');
  await page.getByRole('textbox', { name: 'Nombre completo' }).click();
  await page.getByRole('textbox', { name: 'Nombre completo' }).fill('');
  await page
    .getByRole('textbox', { name: 'Nombre completo' })
    .press('CapsLock');
  await page
    .getByRole('textbox', { name: 'Nombre completo' })
    .fill('LUIS GUERRA');
  await page.getByRole('textbox', { name: 'Teléfono' }).click();
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('3158789765');
  await page.getByRole('textbox', { name: 'Correo' }).click();
  await page.getByRole('textbox', { name: 'Correo' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Correo' }).fill('luis@hotmail.com');
  await page.getByRole('textbox', { name: 'Documento' }).click();
  await page.getByRole('textbox', { name: 'Documento' }).fill('76.349.987');
  await page.getByRole('textbox', { name: 'Entrada' }).fill('2026-06-25');
  await page.getByRole('textbox', { name: 'Salida' }).fill('2026-06-27');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
});
