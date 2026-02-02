-- Enable realtime for pizzeria_settings and menu_items tables
ALTER PUBLICATION supabase_realtime ADD TABLE pizzeria_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;