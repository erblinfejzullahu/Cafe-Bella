"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Minus, ShoppingBag, X, Star, ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Footer } from "@/components/contact-section"
import { useCartStore } from "@/lib/store/cart"
import { toast } from "sonner"
import type { Product, Category } from "@/types"
import { cn } from "@/lib/utils"

// ─── Category cards ───────────────────────────────────────────────────────────
const CATEGORY_CARDS = [
  { id: "breakfast",             slugs: ["omelettes","eggs-more","breakfast-specials"], label: "Breakfast",                  sub: "Omelettes, eggs, specials & burritos",                      emoji: "🍳", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543", gradient: "from-amber-900/70" },
  { id: "pancakes-waffles-crepes",slugs: ["pancakes-waffles","french-toast-crepes"],   label: "Pancakes, Waffles & Crepes", sub: "Buttermilk pancakes, Belgian waffles, French toast & crepes", emoji: "🧇", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445", gradient: "from-orange-900/70" },
  { id: "skillets",              slugs: ["skillets"],                                   label: "Skillets",                   sub: "13 skillet varieties — all $11.99",                         emoji: "🥘", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0", gradient: "from-red-900/70" },
  { id: "salads-plates",         slugs: ["salads-plates"],                              label: "Salads & Plates",            sub: "Fresh salads, plates & the famous Gyros Plate",             emoji: "🥗", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", gradient: "from-green-900/70" },
  { id: "burgers",               slugs: ["burgers"],                                    label: "Burgers",                    sub: "1/3 lb. fresh-ground beef burgers & melts",                 emoji: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", gradient: "from-yellow-900/70" },
  { id: "sandwiches-wraps",      slugs: ["sandwiches-wraps"],                           label: "Sandwiches & Wraps",         sub: "Clubs, chicken sandwiches, wraps, subs & croissants",       emoji: "🥪", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980", gradient: "from-stone-900/70" },
  { id: "sides-soups",           slugs: ["sides-soups"],                                label: "Soups, Sides & Appetizers",  sub: "Homemade soup, cheese curds, hash browns & more",          emoji: "🍲", image: "https://images.unsplash.com/photo-1547592180-85f173990554", gradient: "from-blue-900/70" },
  { id: "desserts",              slugs: ["desserts"],                                    label: "Desserts",                   sub: "Cheesecake, pies & assorted cakes",                         emoji: "🍰", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307", gradient: "from-pink-900/70" },
  { id: "beverages",             slugs: ["beverages"],                                   label: "Beverages",                  sub: "Coffee, juice, shakes, lemonade & more",                    emoji: "☕", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93", gradient: "from-stone-900/70" },
  { id: "kids",                  slugs: ["kids"],                                        label: "Kids Menu",                  sub: "For children 12 & under — served with a drink",             emoji: "🧒", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445", gradient: "from-purple-900/70" },
]

// ─── Static categories (slugs used as IDs for the fallback data) ─────────────
const STATIC_CATEGORIES: Category[] = [
  { id: "omelettes",           name: "Omelettes",             slug: "omelettes",           icon: "🍳", description: null, display_order: 1,  created_at: "" },
  { id: "eggs-more",           name: "Eggs & More",           slug: "eggs-more",           icon: "🥚", description: null, display_order: 2,  created_at: "" },
  { id: "skillets",            name: "Skillets",              slug: "skillets",            icon: "🥘", description: null, display_order: 3,  created_at: "" },
  { id: "pancakes-waffles",    name: "Pancakes & Waffles",    slug: "pancakes-waffles",    icon: "🧇", description: null, display_order: 4,  created_at: "" },
  { id: "french-toast-crepes", name: "French Toast & Crepes", slug: "french-toast-crepes", icon: "🥞", description: null, display_order: 5,  created_at: "" },
  { id: "breakfast-specials",  name: "Breakfast Specials",    slug: "breakfast-specials",  icon: "⭐", description: null, display_order: 6,  created_at: "" },
  { id: "salads-plates",       name: "Salads & Plates",       slug: "salads-plates",       icon: "🥗", description: null, display_order: 7,  created_at: "" },
  { id: "burgers",             name: "Burgers",               slug: "burgers",             icon: "🍔", description: null, display_order: 8,  created_at: "" },
  { id: "sandwiches-wraps",    name: "Sandwiches & Wraps",    slug: "sandwiches-wraps",    icon: "🥪", description: null, display_order: 9,  created_at: "" },
  { id: "sides-soups",         name: "Soups, Sides & Apps",   slug: "sides-soups",         icon: "🍲", description: null, display_order: 10, created_at: "" },
  { id: "desserts",            name: "Desserts",              slug: "desserts",            icon: "🍰", description: null, display_order: 11, created_at: "" },
  { id: "beverages",           name: "Beverages",             slug: "beverages",           icon: "☕", description: null, display_order: 12, created_at: "" },
  { id: "kids",                name: "Kids Menu",             slug: "kids",                icon: "🧒", description: null, display_order: 13, created_at: "" },
]

// ─── Slug resolver — works for both static (slug as ID) and Supabase products
//     Supabase products have `categories: { slug }` joined; static use slug as category_id
type ProductWithCat = Product & { categories?: { slug: string } | null }

function getProductSlug(prod: ProductWithCat): string {
  // 1. Supabase joined data
  if (prod.categories?.slug) return prod.categories.slug
  // 2. Static data: category_id IS the slug
  const match = STATIC_CATEGORIES.find(c => c.id === prod.category_id || c.slug === prod.category_id)
  if (match) return match.slug
  return prod.category_id ?? ""
}

// ─── Static product helper ────────────────────────────────────────────────────
const p = (id: string, cat: string, name: string, desc: string, price: number, popular = false, ord = 0): Product => ({
  id, category_id: cat, name, description: desc, price, is_popular: popular,
  is_available: true, image_url: null, allergens: [], calories: null, display_order: ord, created_at: "", updated_at: "",
})

const STATIC_PRODUCTS: Product[] = [
  p("o1","omelettes","Feta Cheese Omelette","Made with fresh eggs, served with hash browns or fruit, toast with butter and jelly",8.99,false,1),
  p("o2","omelettes","American Cheese Omelette","Made with fresh eggs, served with hash browns or fruit, toast with butter and jelly",8.99,false,2),
  p("o3","omelettes","Ham Omelette","Made with fresh eggs, served with hash browns or fruit, toast with butter and jelly",8.99,false,3),
  p("o4","omelettes","Ham & Cheese Omelette","Made with fresh eggs, served with hash browns or fruit, toast with butter and jelly",9.59,true,4),
  p("o5","omelettes","Mushroom Omelette","Made with fresh eggs, served with hash browns or fruit, toast with butter and jelly",8.99,false,5),
  p("o6","omelettes","Bacon & Cheese Omelette","Made with fresh eggs, served with hash browns or fruit, toast with butter and jelly",9.59,false,6),
  p("o7","omelettes","Gyro Omelette with Feta Cheese","Made with fresh eggs and gyro meat, served with hash browns or fruit, toast with butter and jelly",9.99,true,7),
  p("o8","omelettes","Spinach & Feta Cheese Omelette","Made with fresh eggs, served with hash browns or fruit, toast with butter and jelly",9.59,false,8),
  p("o9","omelettes","Denver Omelette","Filled with green pepper, onion and ham. Served with hash browns or fruit and toast",9.09,false,9),
  p("o10","omelettes","Western Omelette","Filled with tomato, onion, ham, green pepper and American cheese",9.59,false,10),
  p("o11","omelettes","Veggie Omelette","Filled with green pepper, tomato, mushroom and onion",8.99,false,11),
  p("o12","omelettes","Broccoli & Cheese Omelette","With broccoli and American cheese",9.59,false,12),
  p("o13","omelettes","Taco Omelette","With taco meat, onions, green peppers, black olives, cheddar cheese, topped with lettuce and tomatoes",9.59,false,13),
  p("o14","omelettes","Farmer Omelette","With ground beef, onions, green peppers and cheddar cheese",9.59,false,14),
  p("o15","omelettes","Meat Omelette","With bacon, ham and sausage",9.99,false,15),
  p("o16","omelettes","Combo Omelette","With bacon, ham, sausage, onions, green peppers, mushrooms, tomatoes and cheddar cheese",9.99,true,16),
  p("o17","omelettes","California Omelette","With spinach, tomatoes and cheddar cheese",9.99,false,17),
  p("o18","omelettes","Chorizo Omelette","With chorizo, tomatoes, onions, jalapeño and cheddar cheese",9.99,false,18),
  p("o19","omelettes","Corned Beef Hash Omelette","With corned beef hash, onions, tomatoes, green peppers and cheddar cheese",9.99,false,19),
  p("e1","eggs-more","Two Country Fresh Eggs","Farm fresh eggs any style, served with hash browns or fruit, buttered toast and jelly",7.99,true,1),
  p("e2","eggs-more","Two Eggs with Meat","Two country fresh eggs with your choice of bacon, sausage, or ham. Served with hash browns or fruit and toast",8.99,true,2),
  p("e3","eggs-more","Corned Beef Hash & Two Eggs","Corned beef hash with two farm fresh eggs any style, hash browns, and toast",10.79,false,3),
  p("e4","eggs-more","Country Fried Steak","Smothered with sausage gravy. Served with hash browns or fruit and toast",13.99,true,4),
  p("e5","eggs-more","Chicken Fried Steak","Choice of sausage gravy or hollandaise sauce. Served with hash browns or fruit and toast",13.99,false,5),
  p("e6","eggs-more","Sausage Patties","Served with hash browns or fruit, buttered toast and jelly",9.29,false,6),
  p("e7","eggs-more","Rib Eye Steak & Eggs","Charcoal rib eye steak with two country fresh eggs any style, hash browns or fruit, and toast",15.99,true,7),
  p("e8","eggs-more","Sirloin Steak & Eggs","Charcoal sirloin steak with two country fresh eggs any style, hash browns or fruit, and toast",13.99,true,8),
  p("e9","eggs-more","Chopped Sirloin Steak & Eggs","Charcoal chopped sirloin with two country fresh eggs any style, hash browns or fruit, and toast",12.99,false,9),
  p("e10","eggs-more","Gyros & Eggs","Tender slices of gyro meat served with two eggs any style, hash browns or fruit, and toast",11.99,true,10),
  p("sk1","skillets","Steak Fajita Skillet","Seasoned steak strips, onions, green peppers, tomatoes, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,true,1),
  p("sk2","skillets","Spanish Skillet","Seasoned ground beef, onions, green peppers, tomatoes, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,false,2),
  p("sk3","skillets","House Skillet","Chopped sausage, onions, green peppers, tomatoes, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,false,3),
  p("sk4","skillets","Corned Beef Hash Skillet","Corned beef hash, onions, green peppers, tomatoes, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,false,4),
  p("sk5","skillets","Chicken Skillet","Seasoned chicken breast, onions, green peppers, tomatoes, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,true,5),
  p("sk6","skillets","Veggie Skillet","Green peppers, onions, mushrooms, tomatoes, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,false,6),
  p("sk7","skillets","Meat Skillet","Bacon, sausage, ham and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,true,7),
  p("sk8","skillets","Combo Skillet","Bacon, sausage, ham, green peppers, onions, mushrooms, tomatoes, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,true,8),
  p("sk9","skillets","Mediterranean Skillet","Gyro meat, green peppers, tomatoes, onions, and feta cheese. Includes hash browns, toast, and two eggs any style",11.99,false,9),
  p("sk10","skillets","Benedict Skillet","Ham, green peppers, tomatoes, red onions, and hollandaise sauce. Includes hash browns, toast, and two eggs any style",11.99,false,10),
  p("sk11","skillets","Chorizo Skillet","Chorizo, green peppers, onions, tomatoes, jalapeños, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,false,11),
  p("sk12","skillets","Sirloin Tips Skillet","Sautéed sirloin tips, marinated onions and mushrooms, and cheddar cheese. Includes hash browns, toast, and two eggs any style",11.99,false,12),
  p("sk13","skillets","Chicken Chipotle Skillet","Seasoned chicken breast, green peppers, onions, tomatoes, cheddar cheese, topped with chipotle sauce. Includes hash browns, toast, and two eggs any style",11.99,false,13),
  p("pw1","pancakes-waffles","Fluffy Buttermilk Pancakes (3)","3 light and fluffy buttermilk pancakes",8.79,true,1),
  p("pw2","pancakes-waffles","Fruit Pancakes (3)","Your choice of apple, blueberry, cherry, or strawberry",9.79,false,2),
  p("pw3","pancakes-waffles","Short Stack Buttermilk Pancakes (2)","2 fluffy buttermilk pancakes",7.79,false,3),
  p("pw4","pancakes-waffles","Short Stack Fruit Pancakes (2)","2 fruit pancakes, your choice of apple, blueberry, cherry or strawberry",8.79,false,4),
  p("pw5","pancakes-waffles","Tropical Pancakes","Banana, kiwi, and strawberry with raspberry sauce",9.99,true,5),
  p("pw6","pancakes-waffles","Chocolate Chip Pancakes","3 fluffy pancakes loaded with chocolate chips",9.29,false,6),
  p("pw7","pancakes-waffles","Pecan Pancakes","3 fluffy pancakes topped with crunchy pecans",9.29,false,7),
  p("pw8","pancakes-waffles","Pigs in a Blanket (3)","Sausage wrapped in fluffy pancakes",7.79,false,8),
  p("pw9","pancakes-waffles","Golden Brown Belgium Waffle","Classic Belgian waffle. With blueberry, cherry, strawberry, or apple add $0.90",8.39,true,9),
  p("pw10","pancakes-waffles","Alaskan Belgium Waffle","Belgian waffle with vanilla ice cream, strawberry, and whipped cream",9.79,false,10),
  p("pw11","pancakes-waffles","Tropical Waffle","Belgian waffle with banana, kiwi, and strawberry with raspberry sauce",9.99,false,11),
  p("pw12","pancakes-waffles","Banana Split Pancakes","3 pancakes with bananas, strawberries, vanilla ice cream, whipped cream, caramel and chocolate sauce",8.25,false,12),
  p("pw13","pancakes-waffles","Banana Split Waffle","Belgian waffle with bananas, strawberries, vanilla ice cream, whipped cream, caramel and chocolate sauce",8.25,false,13),
  p("ft1","french-toast-crepes","French Toast (3)","3 slices of golden French toast. With blueberry, cherry, strawberry, or apple add $1.00",8.79,true,1),
  p("ft2","french-toast-crepes","Short French Toast (2)","2 slices of golden French toast. With blueberry, cherry, strawberry, or apple add $1.00",7.79,false,2),
  p("ft3","french-toast-crepes","Bavarian French Toast","Strawberry-banana French toast",9.29,false,3),
  p("ft4","french-toast-crepes","Strawberry Cheesecake French Toast","Our famous strawberry cheesecake French toast",9.99,true,4),
  p("ft5","french-toast-crepes","Tropical French Toast","French toast with banana, kiwi, and strawberry with raspberry sauce",9.99,false,5),
  p("ft6","french-toast-crepes","3 Crepes (Strawberry, Blueberry or Cherry)","3 delicate crepes served with whipped cream",8.99,true,6),
  p("ft7","french-toast-crepes","Strawberry-Banana-Nutella Crepe","Topped with whipped cream and chocolate sauce",9.29,false,7),
  p("ft8","french-toast-crepes","Bavarian Crepes","Strawberry-banana crepes",9.29,false,8),
  p("ft9","french-toast-crepes","3 Strawberry or Blueberry Blintz","3 delicate blintzes with cream cheese",8.99,false,9),
  p("ft10","french-toast-crepes","Banana Split Crepes","Crepes with bananas, strawberries, vanilla ice cream, whipped cream, caramel and chocolate sauce",8.25,false,10),
  p("bs1","breakfast-specials","Eggs Benedict with Canadian Bacon","Two poached eggs smothered in hollandaise sauce on an English muffin. Choice of hash browns or fruit",10.99,true,1),
  p("bs2","breakfast-specials","Eggs Benedict with Crab Meat","Crab meat Benedict smothered in hollandaise sauce on an English muffin",11.29,false,2),
  p("bs3","breakfast-specials","California Eggs Benedict","With cherry tomatoes, fresh spinach, and avocados, smothered in hollandaise sauce",11.99,false,3),
  p("bs4","breakfast-specials","Mediterranean Eggs Benedict","With chicken breast and fresh spinach, smothered in hollandaise sauce on an English muffin",11.99,false,4),
  p("bs5","breakfast-specials","Biscuits & Gravy","Freshly made biscuits smothered with rich sausage gravy (add 2 eggs +$1.00)",9.99,true,5),
  p("bs6","breakfast-specials","2+2+2 Special","Two eggs, two pancakes (French toast or crepes), two pieces of bacon, sausage, or ham",10.99,true,6),
  p("bs7","breakfast-specials","Two Fried Egg Croissant","Served with bacon or ham, garnished with fresh fruit",9.99,false,7),
  p("bs8","breakfast-specials","Denver Burrito","3 scrambled eggs, green pepper, onion, ham, and cheddar cheese. With sour cream, salsa, choice of fruit or hash browns",9.99,false,8),
  p("bs9","breakfast-specials","Western Burrito","3 scrambled eggs, tomato, onion, ham, green pepper, and cheddar cheese. Served with sour cream and salsa",9.99,false,9),
  p("bs10","breakfast-specials","Veggie Burrito","3 scrambled eggs, green pepper, tomato, mushroom, onion, and cheddar cheese. Served with sour cream and salsa",9.99,false,10),
  p("bs11","breakfast-specials","Bacon Burrito","Bacon, 3 scrambled eggs, and cheddar cheese. Served with sour cream and salsa",9.99,false,11),
  p("bs12","breakfast-specials","Sausage Burrito","Sausage, 3 scrambled eggs, and cheddar cheese. Served with sour cream and salsa",9.99,false,12),
  p("bs13","breakfast-specials","Ham Burrito","Ham, 3 scrambled eggs, and cheddar cheese. Served with sour cream and salsa",9.99,false,13),
  p("sl1","salads-plates","Chicken Special Salad","Romaine & Spring Mix, dried cranberries, pecans, strawberries, cherry tomatoes, cucumbers, boiled egg, and Provolone. Served with homemade soup",11.99,true,1),
  p("sl2","salads-plates","Cobb Salad","Romaine & Spring Mix, bacon, red onions, boiled egg, cucumbers, cherry tomatoes, black olives, and cheddar. Served with homemade soup",10.99,false,2),
  p("sl3","salads-plates","Chef's Salad","Beef, turkey, Romaine & Spring Mix, cherry tomatoes, cucumbers, boiled egg, and cheddar. Served with homemade soup",10.99,false,3),
  p("sl4","salads-plates","Taco Salad","Seasoned ground beef or chicken with lettuce, tomato, onion, black olives, cheddar, sour cream and salsa in an edible tortilla bowl",10.99,false,4),
  p("sl5","salads-plates","Steak Salad","Romaine & Spring Mix, red onions, cherry tomatoes, cucumbers, cheddar and avocado ranch dressing. Served with homemade soup",11.29,false,5),
  p("sl6","salads-plates","Southwest Chicken Salad","Cajun chicken, Romaine & Spring Mix, onions, cherry tomatoes, avocado, cheddar, crisp tortilla strips, ranch salsa dressing",10.99,false,6),
  p("sl7","salads-plates","Buffalo Chicken Strip Salad","Chicken strips tossed in Buffalo sauce, Romaine & Spring Mix, onions, celery, cherry tomatoes, avocado, Monterey cheese",10.99,false,7),
  p("sl8","salads-plates","Athenian Salad","Lettuce with feta, tomato, black olives, green pepper, cucumber, boiled egg, with vinegar and oil dressing",10.99,false,8),
  p("sl9","salads-plates","Wedge Salad","Romaine & Spring Mix, bacon, cherry tomatoes, boiled egg, feta cheese, and bleu cheese dressing",10.49,false,9),
  p("sl10","salads-plates","Julienne Salad","Lettuce topped with ham, turkey, American cheese, tomato, cucumber, and a boiled egg, with your choice of dressing",10.99,false,10),
  p("sl11","salads-plates","Santa Fe Salad","Blackened chicken, Romaine & Spring Mix, red onions, cherry tomatoes, jalapeños, cheddar, crisp tortilla strips, salsa ranch",10.99,false,11),
  p("sl12","salads-plates","Gyros Plate","Tender slices of gyros on pita bread with onion, tomato, and cucumber sauce. Served with a small Grecian salad and choice of potato",14.49,true,12),
  p("sl13","salads-plates","Fresh Fruit Plate","Assorted fruits served with cottage cheese or ice cream and raisin toast. Served with a cup of homemade soup",11.99,false,13),
  p("sl14","salads-plates","Chicken Delight","Chicken breast served with cottage cheese, tomato, cucumber, boiled egg, and fresh fruit",12.99,false,14),
  p("sl15","salads-plates","Weight Watchers Plate","Broiled center cut sirloin steak, with cottage cheese, hard-boiled egg, sliced tomato, cucumber, and fresh fruit garnish",13.99,false,15),
  p("b1","burgers","Beef Burger","1/3 lb. freshly ground beef on a toasted bun. Served with pickle, fries or fruit, and a cup of homemade soup",10.79,false,1),
  p("b2","burgers","The Wisconsin Burger","1/3 lb. beef burger with American cheese. Served with pickle, fries or fruit, and a cup of homemade soup",11.29,false,2),
  p("b3","burgers","Bacon Cheeseburger","1/3 lb. beef burger with thick cheese and crispy bacon. Served with pickle, fries or fruit, and a cup of homemade soup",12.09,true,3),
  p("b4","burgers","Alpine Burger","1/3 lb. beef burger with sautéed mushrooms, bacon, and Swiss cheese. Served with pickle, fries or fruit, and homemade soup",12.09,false,4),
  p("b5","burgers","Mushroom & Swiss Burger","1/3 lb. beef burger with sautéed mushrooms and Swiss cheese. Served with pickle, fries or fruit, and homemade soup",11.79,false,5),
  p("b6","burgers","Double Cheese Burger","Double 1/3 lb. beef patties with American cheese. Served with pickle, fries or fruit, and a cup of homemade soup",12.99,false,6),
  p("b7","burgers","Super Burger","1/2 lb. beef burger with raw onion on rye bread with chef's garnish. Served with pickle, fries or fruit, and homemade soup",12.19,false,7),
  p("b8","burgers","Patty Melt","1/3 lb. burger with grilled onion and American cheese on grilled rye bread. Served with pickle, fries or fruit, and homemade soup",11.99,false,8),
  p("sw1","sandwiches-wraps","Gyros Sandwich","Served on pita bread with onion, tomato, cucumber sauce and French fries. With a cup of homemade soup",12.75,true,1),
  p("sw2","sandwiches-wraps","Turkey Bacon Wrap","Turkey breast, crispy bacon, lettuce, cheddar, and creamy ranch. Served with pickle, fries or fruit, and a cup of homemade soup",11.29,true,2),
  p("sw3","sandwiches-wraps","Fajita Wrap","Steak or chicken, green peppers, onion, cheddar, tomato, served with mild salsa. Served with pickle, fries or fruit, and homemade soup",11.59,false,3),
  p("sw4","sandwiches-wraps","Chicken Caesar Wrap","Grilled chicken breast, Romaine lettuce, tomatoes, and parmesan Caesar dressing. With pickle, fries or fruit, and homemade soup",11.49,false,4),
  p("sw5","sandwiches-wraps","Chipotle Chicken Wrap","Grilled chicken breast, tomato, lettuce, onion, and chipotle dressing. With pickle, fries or fruit, and homemade soup",11.49,false,5),
  p("sw6","sandwiches-wraps","Chicken-Bacon Wrap","Grilled chicken breast with bacon, tomato, onion, cheddar cheese, and creamy ranch. With pickle, fries or fruit, and homemade soup",11.49,false,6),
  p("sw7","sandwiches-wraps","BLT Wrap","Crispy bacon, lettuce, tomato, and creamy ranch dressing. With pickle, fries or fruit, and a cup of homemade soup",11.29,false,7),
  p("sw8","sandwiches-wraps","Grilled Chicken Breast Sandwich","Grilled chicken breast served on a bun with fries or fruit, and a cup of homemade soup",11.09,false,8),
  p("sw9","sandwiches-wraps","Southwestern Chicken Sandwich","Chicken breast seasoned with barbecue sauce and topped with mozzarella. Served with fries or fruit, and homemade soup",11.29,false,9),
  p("sw10","sandwiches-wraps","Buffalo Bleu Chicken Sandwich","Grilled chicken with Buffalo sauce and bleu cheese dressing. Served with fries or fruit, and a cup of homemade soup",11.49,false,10),
  p("sw11","sandwiches-wraps","Chicken Cordon Bleu Sandwich","Boneless chicken topped with ham, Canadian bacon, and Swiss cheese. Served with fries or fruit, and homemade soup",11.49,false,11),
  p("sw12","sandwiches-wraps","Philly Sub","With green peppers, onions, mushrooms, provolone and mayo on a sub roll. Served with fries and homemade soup",12.99,false,12),
  p("sw13","sandwiches-wraps","French Dip","Tender slices of roast beef on French bread with au jus for dipping. Served with fries and homemade soup",11.99,false,13),
  p("sw14","sandwiches-wraps","Monte Cristo","French toast topped with ham and Swiss cheese, grilled to perfection. Served with fries and homemade soup",11.49,false,14),
  p("sw15","sandwiches-wraps","Reuben","Classic Reuben with sauerkraut on rye bread with Swiss cheese. Served with fries and homemade soup",11.89,false,15),
  p("sw16","sandwiches-wraps","Fish Sandwich","Served on a toasted bun with fries or fruit, and a cup of homemade soup",11.29,false,16),
  p("sw17","sandwiches-wraps","Club Sandwich","BLT Club, Turkey Club, Ace of Clubs, or Ham & American Cheese on toast with fries or fruit, and homemade soup",11.99,false,17),
  p("sw18","sandwiches-wraps","Open Face Hot Sandwich","Hot Ham, Hot Pork, Hot Beef, Hot Turkey or Hot Hamburger with mashed potatoes, gravy, and homemade soup",11.79,false,18),
  p("sw19","sandwiches-wraps","BLT on Toast","Classic BLT with crispy bacon, lettuce, and fresh tomato on toast",10.69,false,19),
  p("sw20","sandwiches-wraps","Chicken Strips","Served with French fries and your choice of sauce. With a cup of homemade soup",12.75,false,20),
  p("sw21","sandwiches-wraps","Turkey Melt","All-white tender turkey meat topped with Swiss cheese on grilled rye bread. With pickle, fries or fruit, and homemade soup",11.99,false,21),
  p("sw22","sandwiches-wraps","Gigantic Roll Up Special","Chicken or roasted beef in a gigantic flour tortilla with green pepper, mushrooms, onion, mozzarella. Served with sour cream and salsa",12.55,false,22),
  p("ss1","sides-soups","Homemade Soup - Bowl","All made fresh daily. Ask your server for today's selections",3.79,true,1),
  p("ss2","sides-soups","Homemade Soup - Cup","All made fresh daily. Ask your server for today's selections",3.09,false,2),
  p("ss3","sides-soups","Side Salad","Fresh house salad",3.59,false,3),
  p("ss4","sides-soups","Breaded Mushrooms","Deep fried to a golden brown",6.99,true,4),
  p("ss5","sides-soups","Cheese Curds","Wisconsin cheese curds, golden fried",7.75,true,5),
  p("ss6","sides-soups","Battered Onions","Golden battered onion rings",6.89,false,6),
  p("ss7","sides-soups","Hash Browns","Golden shredded hash browns",3.00,true,7),
  p("ss8","sides-soups","Ham, Bacon, or Sausage","Your choice of breakfast meat side",3.99,false,8),
  p("ss9","sides-soups","Corned Beef Hash","Classic corned beef hash side",5.00,false,9),
  p("ss10","sides-soups","Toast & Jelly","White, wheat, or sourdough with butter and jelly",2.75,false,10),
  p("ss11","sides-soups","Pecan Roll","Freshly baked pecan roll",4.99,false,11),
  p("ss12","sides-soups","Oatmeal Cup","Warm oatmeal cup",3.80,false,12),
  p("ss13","sides-soups","Oatmeal Bowl","Warm oatmeal bowl",4.80,false,13),
  p("ss14","sides-soups","Bagel","Toasted bagel (add cream cheese $1.05)",3.09,false,14),
  p("d1","desserts","Plain Cheesecake","Classic New York style cheesecake",4.49,true,1),
  p("d2","desserts","Cherry Cheesecake","Creamy cheesecake topped with cherry sauce",4.49,false,2),
  p("d3","desserts","Assorted Cakes","Ask your server for today's cake selections",4.49,false,3),
  p("d4","desserts","Assorted Fruit Pies","Ask your server for today's pie selections",4.49,false,4),
  p("d5","desserts","Pie A-La-Mode","Your choice of pie served with vanilla ice cream",4.49,false,5),
  p("bv1","beverages","Coffee","Freshly brewed Superior special blend. Regular or decaffeinated — free refills!",2.69,true,1),
  p("bv2","beverages","Freshly Squeezed Orange Juice","Fresh squeezed every morning",5.99,true,2),
  p("bv3","beverages","Iced Coffee","Chilled brewed coffee over ice",5.29,false,3),
  p("bv4","beverages","Cappuccino","French vanilla or salted caramel",5.29,false,4),
  p("bv5","beverages","Pepsi Products","Pepsi, Diet Pepsi, Sierra Mist, and more",2.69,false,5),
  p("bv6","beverages","Iced Tea or Hot Tea","Your choice of iced or hot tea",2.89,false,6),
  p("bv7","beverages","Lemonade","Freshly made lemonade",4.29,false,7),
  p("bv8","beverages","Raspberry Lemonade","Freshly made raspberry lemonade",4.79,false,8),
  p("bv9","beverages","Hot Chocolate","Rich and creamy hot chocolate",3.99,false,9),
  p("bv10","beverages","Milk Shake","Chocolate, strawberry, or vanilla",5.99,true,10),
  p("k1","kids","Big Birds Breakfast","1 egg, 1 pancake, 2 bacon strips or sausage. Served with a kid's drink",6.99,false,1),
  p("k2","kids","Egg Breakfast","1 egg any style, 2 bacon or sausages, hash browns and 1 slice of toast. Served with a kid's drink",6.99,false,2),
  p("k3","kids","Pancake Breakfast","1 fluffy buttermilk pancake with 2 bacon or sausages. Served with a kid's drink",5.99,false,3),
  p("k4","kids","French Toast Breakfast","1 slice of French toast with 2 bacon strips or sausages. Served with a kid's drink",5.99,false,4),
  p("k5","kids","Kids Hamburger with Fries","Kid-sized hamburger with French fries. Served with a kid's drink",7.99,false,5),
  p("k6","kids","Kids Cheeseburger with Fries","Kid-sized cheeseburger with French fries. Served with a kid's drink",7.99,false,6),
  p("k7","kids","Kids Grilled Cheese & Fries","Grilled cheese sandwich with French fries. Served with a kid's drink",7.99,false,7),
  p("k8","kids","Kids Fish Sandwich & Fries","Fish sandwich with French fries. Served with a kid's drink",7.99,false,8),
  p("k9","kids","Kids Chicken Strips & Fries","Chicken strips with French fries. Served with a kid's drink",7.99,false,9),
]

// ─── Category image fallback ──────────────────────────────────────────────────
function getCatImage(slug: string) {
  const card = CATEGORY_CARDS.find(c => c.slugs.includes(slug))
  return card?.image ?? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function MenuPage() {
  const [activeCard, setActiveCard] = useState<typeof CATEGORY_CARDS[0] | null>(null)
  const [products, setProducts]     = useState<ProductWithCat[]>(STATIC_PRODUCTS)
  const [search, setSearch]         = useState("")
  const [showPopularOnly, setShowPopularOnly] = useState(false)

  const { items, addItem, updateQuantity } = useCartStore()
  const totalItems = useCartStore(s => s.totalItems())
  const totalPrice = useCartStore(s => s.totalPrice())

  // Load real products from Supabase (includes joined `categories` object)
  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(({ products: prods }) => {
        if (prods?.length > 10) setProducts(prods.filter((x: ProductWithCat) => x.is_available))
      })
      .catch(() => {/* keep static fallback */})
  }, [])

  // Filter using getProductSlug — handles both static (slug as ID) and Supabase (UUID + categories.slug)
  const visibleProducts = useMemo(() => {
    if (!activeCard) return []
    return products.filter(prod => {
      const slug       = getProductSlug(prod)
      const inCard     = activeCard.slugs.includes(slug)
      const matchSearch = !search
        || prod.name.toLowerCase().includes(search.toLowerCase())
        || prod.description?.toLowerCase().includes(search.toLowerCase())
      const matchPop   = !showPopularOnly || prod.is_popular
      return inCard && matchSearch && matchPop
    })
  }, [products, activeCard, search, showPopularOnly])

  const getQty    = (id: string) => items.find(i => i.id === id)?.quantity ?? 0
  const handleAdd = (product: ProductWithCat) => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url })
    toast.success("Added to cart", { description: product.name })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-foreground/85" />
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666" alt="Cafe Bella" fill className="object-cover opacity-25" priority unoptimized />
        </div>
        <div className="relative container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">Our Menu</h1>
          <p className="text-white/70 text-lg">Made fresh every morning · Breakfast served all day</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-32 mt-8">
        <AnimatePresence mode="wait">

          {/* ── Category card grid ──────────────────────────────────────── */}
          {!activeCard && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-center text-muted-foreground mb-8 text-sm">
                Choose a category to browse the full selection
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {CATEGORY_CARDS.map((card, i) => {
                  // Count uses the same slug resolver so Supabase products are counted correctly
                  const count = products.filter(prod => card.slugs.includes(getProductSlug(prod))).length
                  return (
                    <motion.button
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      onClick={() => setActiveCard(card)}
                      className="group relative h-44 rounded-2xl overflow-hidden text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <Image src={card.image} alt={card.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                      <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} to-transparent`} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl mb-1">{card.emoji}</p>
                            <h3 className="text-white font-bold text-base leading-tight">{card.label}</h3>
                            <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{card.sub}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                              {count} items
                            </span>
                            <ChevronRight className="h-4 w-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Products list ───────────────────────────────────────────── */}
          {activeCard && (
            <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {/* Back + title */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => { setActiveCard(null); setSearch(""); setShowPopularOnly(false) }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm">All Categories</span>
                </button>
                <div className="h-4 w-px bg-border" />
                <span className="text-xl">{activeCard.emoji}</span>
                <h2 className="text-xl font-serif font-bold text-foreground">{activeCard.label}</h2>
              </div>

              {/* Search + popular */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={`Search ${activeCard.label}...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
                </div>
                <button
                  onClick={() => setShowPopularOnly(!showPopularOnly)}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all flex-shrink-0",
                    showPopularOnly ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-primary hover:text-primary")}
                >
                  <Star className={cn("h-4 w-4", showPopularOnly ? "fill-current" : "")} />
                  Popular only
                </button>
              </div>

              {visibleProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">{activeCard.emoji}</p>
                  <p className="text-lg font-medium text-foreground mb-2">No items found</p>
                  <Button variant="outline" onClick={() => { setSearch(""); setShowPopularOnly(false) }}>Clear filters</Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleProducts.map((product, i) => {
                    const qty  = getQty(product.id)
                    const slug = getProductSlug(product)
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.3) }}
                        className="group bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="relative h-28 overflow-hidden bg-secondary">
                          <Image
                            src={product.image_url || getCatImage(slug)}
                            alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                          {product.is_popular && (
                            <span className="absolute top-2 left-2 flex items-center gap-1 bg-accent text-accent-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
                              <Star className="h-2.5 w-2.5 fill-current" /> Popular
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1 leading-tight">{product.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-primary">${product.price.toFixed(2)}</span>
                            {qty > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => updateQuantity(product.id, qty - 1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-5 text-center text-sm font-bold">{qty}</span>
                                <button onClick={() => handleAdd(product)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => handleAdd(product)} className="w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating cart */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-4"
          >
            <Link href="/cart" className="flex items-center gap-4 bg-accent text-accent-foreground shadow-2xl shadow-accent/30 rounded-full px-8 py-4 text-base font-semibold hover:bg-accent/95 transition-colors">
              <ShoppingBag className="h-5 w-5" />
              <span>View Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
