CREATE TABLE `materia` (
	`id` text NOT NULL,
	`nome` text NOT NULL,
	`local` text NOT NULL,
	`horario` text NOT NULL,
	`semestre` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materia_id_idx` ON `materia` (`id`);