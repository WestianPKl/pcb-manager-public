CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(45),
	"manufacturer_number" varchar(200),
	"parameters" jsonb,
	"comment" varchar(255),
	"low_threshold" integer DEFAULT 0,
	"inventory_type_id" uuid,
	"inventory_surface_mount_id" uuid,
	"inventory_package_id" uuid,
	"inventory_shop_id" uuid,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(45) NOT NULL,
	CONSTRAINT "inventory_package_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "inventory_shop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(45) NOT NULL,
	CONSTRAINT "inventory_shop_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "inventory_stock" (
	"inventory_id" uuid PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"updated_by_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_stock_movement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"reason" varchar(50) NOT NULL,
	"note" varchar(255),
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_surface_mount" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(45) NOT NULL,
	CONSTRAINT "inventory_surface_mount_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "inventory_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(45) NOT NULL,
	CONSTRAINT "inventory_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_type_fk" FOREIGN KEY ("inventory_type_id") REFERENCES "public"."inventory_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_package_fk" FOREIGN KEY ("inventory_package_id") REFERENCES "public"."inventory_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_surface_mount_fk" FOREIGN KEY ("inventory_surface_mount_id") REFERENCES "public"."inventory_surface_mount"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_shop_fk" FOREIGN KEY ("inventory_shop_id") REFERENCES "public"."inventory_shop"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_inventory_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock_movement" ADD CONSTRAINT "stock_movement_inventory_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock_movement" ADD CONSTRAINT "stock_movement_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_type_idx" ON "inventory" USING btree ("inventory_type_id");--> statement-breakpoint
CREATE INDEX "inventory_package_idx" ON "inventory" USING btree ("inventory_package_id");--> statement-breakpoint
CREATE INDEX "inventory_surface_mount_idx" ON "inventory" USING btree ("inventory_surface_mount_id");--> statement-breakpoint
CREATE INDEX "inventory_shop_idx" ON "inventory" USING btree ("inventory_shop_id");--> statement-breakpoint
CREATE INDEX "inventory_created_by_idx" ON "inventory" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "inventory_updated_by_idx" ON "inventory" USING btree ("updated_by_id");--> statement-breakpoint
CREATE INDEX "stock_movement_inventory_idx" ON "inventory_stock_movement" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "stock_movement_created_by_idx" ON "inventory_stock_movement" USING btree ("created_by_id");