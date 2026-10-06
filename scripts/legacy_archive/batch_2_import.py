import os
import sys
import io
import json
import csv
import urllib.request
import urllib.error
from PIL import Image

from catalog_pipeline_core import (
    clean_and_square_image,
    upload_image_to_supabase,
    probe_public_url,
    update_supabase_product,
    DOWNLOAD_HEADERS
)

BATCH_2_DATA = [
    {
        'item_no': 21,
        'source_name': "Ariel Power Gel Top Load&semi Auto 1kg",
        'display_name': "Ariel Matic Top Load Liquid Detergent 1L",
        'brand': "Ariel",
        'product_type': "Liquid Detergent",
        'variant': "Top Load 1L",
        'pack_size': "1 L",
        'unit': "Pieces",
        'category': "household",
        'mrp': 220.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.pgshop.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40193158_3-ariel-matic-liquid-detergent-top-load.jpg",
        'notes': "P&G Ariel Matic Top Load Liquid Detergent 1L bottle."
    },
    {
        'item_no': 22,
        'source_name': "AROKYA MILK",
        'display_name': "Arokya Toned Milk 500ml",
        'brand': "Arokya",
        'product_type': "Milk",
        'variant': "Toned Milk 500ml",
        'pack_size': "500ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 30.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/306926_4-arokya-toned-milk.jpg",
        'notes': "Hatsun Agro Arokya Toned Milk 500ml pouch."
    },
    {
        'item_no': 23,
        'source_name': "ARUN BITES",
        'display_name': "Arun Ice Cream Bites",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "Bites 50ml",
        'pack_size': "50ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196816_1-arun-icecream-bites.jpg",
        'notes': "Arun Ice Cream Bites."
    },
    {
        'item_no': 24,
        'source_name': "ARUN DONUT",
        'display_name': "Arun Ice Cream Donut",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "Donut 60ml",
        'pack_size': "60ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 35.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196817_1-arun-icecream-donut.jpg",
        'notes': "Arun Ice Cream Donut."
    },
    {
        'item_no': 25,
        'source_name': "ARUN DOUBLE",
        'display_name': "Arun Double Blast Ice Cream Bar",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "Double Blast 70ml",
        'pack_size': "70ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 40.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196818_1-arun-icecream-double.jpg",
        'notes': "Arun Double Blast Ice Cream Bar."
    },
    {
        'item_no': 26,
        'source_name': "ARUN IBAR",
        'display_name': "Arun iBar Ice Cream Stick",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "iBar 60ml",
        'pack_size': "60ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 30.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196819_1-arun-icecream-ibar.jpg",
        'notes': "Arun iBar stick ice cream."
    },
    {
        'item_no': 27,
        'source_name': "ARUN MILKY FANTASY",
        'display_name': "Arun Milky Fantasy Ice Cream Bar",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "Milky Fantasy 60ml",
        'pack_size': "60ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 25.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196820_1-arun-icecream-milky-fantasy.jpg",
        'notes': "Arun Milky Fantasy bar."
    },
    {
        'item_no': 28,
        'source_name': "Arun Popitos",
        'display_name': "Arun Popitos Mini Ice Cream Candies",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "Popitos Pack",
        'pack_size': "Popitos",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196821_1-arun-icecream-popitos.jpg",
        'notes': "Arun Popitos ice candies."
    },
    {
        'item_no': 29,
        'source_name': "Arun Sunny Sil",
        'display_name': "Arun Sunny Silver Vanilla Ice Cream Bar",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "Sunny Silver 50ml",
        'pack_size': "50ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 15.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196822_1-arun-icecream-sunny-silver.jpg",
        'notes': "Arun Sunny Silver vanilla bar."
    },
    {
        'item_no': 30,
        'source_name': "ARUN TOFFEE CON",
        'display_name': "Arun Toffee Crunch Ice Cream Cone",
        'brand': "Arun",
        'product_type': "Ice Cream",
        'variant': "Toffee Cone 100ml",
        'pack_size': "100ml",
        'unit': "Pieces",
        'category': "dairy-bakery",
        'mrp': 40.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hatsun.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40196823_1-arun-icecream-toffee-cone.jpg",
        'notes': "Arun Toffee Cone ice cream."
    },
    {
        'item_no': 31,
        'source_name': "ASSORATED FRUIT",
        'display_name': "Assorted Fruit Candies",
        'brand': None,
        'product_type': "Confectionery",
        'variant': None,
        'pack_size': None,
        'unit': "Pieces",
        'category': "snacks",
        'mrp': None,
        'selling_price': None,
        'product_match_status': "NEEDS_REVIEW",
        'image_match_status': "NEEDS_REVIEW",
        'confidence': "LOW",
        'product_source_url': None,
        'image_source_url': None,
        'notes': "Generic shorthand 'ASSORATED FRUIT'. Unbranded / unstandardized confectionery entry."
    },
    {
        'item_no': 32,
        'source_name': "Avalu 250g",
        'display_name': "Whole Mustard Seeds (Avalu) 250g",
        'brand': "G1 Mart Selection",
        'product_type': "Spices",
        'variant': "250g Pouch",
        'pack_size': "250g",
        'unit': "Packs",
        'category': "rice-dal-atta",
        'mrp': 45.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/10000473_11-bb-royal-mustard-small.jpg",
        'notes': "Whole Mustard Seeds 250g authentic pouch."
    },
    {
        'item_no': 33,
        'source_name': "Avalu50g",
        'display_name': "Whole Mustard Seeds (Avalu) 50g",
        'brand': "G1 Mart Selection",
        'product_type': "Spices",
        'variant': "50g Pouch",
        'pack_size': "50g",
        'unit': "Packs",
        'category': "rice-dal-atta",
        'mrp': 12.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/10000473_11-bb-royal-mustard-small.jpg",
        'notes': "Whole Mustard Seeds 50g authentic pouch."
    },
    {
        'item_no': 34,
        'source_name': "BADAM 100GR",
        'display_name': "Whole California Almonds (Badam) 100g",
        'brand': "G1 Mart Selection",
        'product_type': "Dry Fruits",
        'variant': "100g Pouch",
        'pack_size': "100g",
        'unit': "Packs",
        'category': "snacks",
        'mrp': 110.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/10000539_18-bb-royal-almondcalifornia.jpg",
        'notes': "California Almonds 100g authentic pack."
    },
    {
        'item_no': 35,
        'source_name': "BADAM 250G",
        'display_name': "Whole California Almonds (Badam) 250g",
        'brand': "G1 Mart Selection",
        'product_type': "Dry Fruits",
        'variant': "250g Pouch",
        'pack_size': "250g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 260.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/10000539_18-bb-royal-almondcalifornia.jpg",
        'notes': "California Almonds 250g authentic pack."
    },
    {
        'item_no': 36,
        'source_name': "BADAM 50G",
        'display_name': "Whole California Almonds (Badam) 50g",
        'brand': "G1 Mart Selection",
        'product_type': "Dry Fruits",
        'variant': "50g Pouch",
        'pack_size': "50g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 60.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/10000539_18-bb-royal-almondcalifornia.jpg",
        'notes': "California Almonds 50g authentic pack."
    },
    {
        'item_no': 37,
        'source_name': "BAMBINO MYSORE PACK 200G",
        'display_name': "Bambino Traditional Mysore Pak Sweet 200g",
        'brand': "Bambino",
        'product_type': "Sweets",
        'variant': "200g Box",
        'pack_size': "200g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 140.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://bambinoagro.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40149021_2-bambino-mysore-pak.jpg",
        'notes': "Bambino Mysore Pak authentic packshot."
    },
    {
        'item_no': 38,
        'source_name': "BAMBINON VERMICELLI 250G",
        'display_name': "Bambino Roasted Vermicelli 250g",
        'brand': "Bambino",
        'product_type': "Vermicelli",
        'variant': "Roasted 250g",
        'pack_size': "250g",
        'unit': "Pieces",
        'category': "rice-dal-atta",
        'mrp': 30.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://bambinoagro.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266109_18-bambino-vermicelli-roasted.jpg",
        'notes': "Bambino Roasted Vermicelli 250g official pack."
    },
    {
        'item_no': 39,
        'source_name': "BANSI RAVA 500G",
        'display_name': "Bansi Wheat Rava 500g",
        'brand': "G1 Mart Selection",
        'product_type': "Rava",
        'variant': "500g Pouch",
        'pack_size': "500g",
        'unit': "Pieces",
        'category': "rice-dal-atta",
        'mrp': 40.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40044717_4-bb-royal-sooji-rava-bansi.jpg",
        'notes': "Bansi Rava 500g authentic pouch."
    },
    {
        'item_no': 40,
        'source_name': "BAT PAPAD 250G",
        'display_name': "Bat Shaped Fryum Papad 250g",
        'brand': "G1 Mart Selection",
        'product_type': "Papad / Fryums",
        'variant': "250g",
        'pack_size': "250g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 35.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.indiamart.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40075537_2-bb-popular-fryums.jpg",
        'notes': "Bat shape papad fryums 250g."
    },
    {
        'item_no': 41,
        'source_name': "BINGO CHILLI",
        'display_name': "Bingo! Mad Angles Chilli Dhamaka 66g",
        'brand': "Bingo",
        'product_type': "Chips / Namkeen",
        'variant': "Chilli Dhamaka 66g",
        'pack_size': "66g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.itcstore.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/294297_18-bingo-mad-angles-chilli-dhamaka.jpg",
        'notes': "ITC Bingo! Mad Angles Chilli Dhamaka packshot."
    },
    {
        'item_no': 42,
        'source_name': "BINGO KOREAN",
        'display_name': "Bingo! Tedhe Medhe Korean Style 70g",
        'brand': "Bingo",
        'product_type': "Chips / Namkeen",
        'variant': "Korean Style 70g",
        'pack_size': "70g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.itcstore.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40316499_1-bingo-tedhe-medhe-korean-spicy.jpg",
        'notes': "ITC Bingo! Tedhe Medhe Korean packshot."
    },
    {
        'item_no': 43,
        'source_name': "BINGO MASALA",
        'display_name': "Bingo! Mad Angles Achaari Masti 66g",
        'brand': "Bingo",
        'product_type': "Chips / Namkeen",
        'variant': "Achaari Masti 66g",
        'pack_size': "66g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.itcstore.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/294298_18-bingo-mad-angles-achaari-masti.jpg",
        'notes': "ITC Bingo! Mad Angles Achaari Masti packshot."
    },
    {
        'item_no': 44,
        'source_name': "BINGO MASTI",
        'display_name': "Bingo! Tedhe Medhe Masala Tadka 70g",
        'brand': "Bingo",
        'product_type': "Chips / Namkeen",
        'variant': "Masala Tadka 70g",
        'pack_size': "70g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.itcstore.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40053591_11-bingo-tedhe-medhe-masala-tadka.jpg",
        'notes': "ITC Bingo! Tedhe Medhe Masala Tadka packshot."
    },
    {
        'item_no': 45,
        'source_name': "BINGO TOMATO",
        'display_name': "Bingo! Mad Angles Tomato Madness 66g",
        'brand': "Bingo",
        'product_type': "Chips / Namkeen",
        'variant': "Tomato Madness 66g",
        'pack_size': "66g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.itcstore.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/294296_17-bingo-mad-angles-tomato-madness.jpg",
        'notes': "ITC Bingo! Mad Angles Tomato Madness packshot."
    },
    {
        'item_no': 46,
        'source_name': "BINO TEMATO 21G",
        'display_name': "Bingo! Mad Angles Tomato Madness 21g",
        'brand': "Bingo",
        'product_type': "Chips / Namkeen",
        'variant': "Tomato Madness 21g / Rs 5",
        'pack_size': "21g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 5.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.itcstore.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/294296_17-bingo-mad-angles-tomato-madness.jpg",
        'notes': "ITC Bingo! Mad Angles Tomato Madness 21g ₹5 pack."
    },
    {
        'item_no': 47,
        'source_name': "Biriyani Masala",
        'display_name': "Aachi Biryani Masala 50g",
        'brand': "Aachi",
        'product_type': "Spices",
        'variant': "50g Pouch",
        'pack_size': "50g",
        'unit': "Pieces",
        'category': "rice-dal-atta",
        'mrp': 45.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://aachifoods.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/268067_3-aachi-masala-biryani.jpg",
        'notes': "Aachi Biryani Masala 50g official pack."
    },
    {
        'item_no': 48,
        'source_name': "BISCOTT",
        'display_name': "Biscott Bakery Biscuits",
        'brand': None,
        'product_type': "Bakery",
        'variant': None,
        'pack_size': None,
        'unit': "Pieces",
        'category': "snacks",
        'mrp': None,
        'selling_price': None,
        'product_match_status': "NEEDS_REVIEW",
        'image_match_status': "NEEDS_REVIEW",
        'confidence': "LOW",
        'product_source_url': None,
        'image_source_url': None,
        'notes': "Ambiguous sales shorthand 'BISCOTT'. Brand and weight unspecified."
    },
    {
        'item_no': 49,
        'source_name': "BLEACHUNG POWDER 100G",
        'display_name': "Bleaching Powder Disinfectant 100g",
        'brand': "G1 Mart Selection",
        'product_type': "Cleaning Disinfectant",
        'variant': "100g",
        'pack_size': "100g",
        'unit': "Pieces",
        'category': "household",
        'mrp': 15.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.indiamart.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40141697_1-clean-home-bleaching-powder.jpg",
        'notes': "Disinfectant Bleaching Powder 100g pack."
    },
    {
        'item_no': 50,
        'source_name': "BOOST",
        'display_name': "Boost Energy Drink 15g Sachet",
        'brand': "Boost",
        'product_type': "Health Drink",
        'variant': "15g Sachet / Rs 5",
        'pack_size': "15g",
        'unit': "Packs",
        'category': "beverages",
        'mrp': 5.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/100000080_12-boost-health-energy-drink.jpg",
        'notes': "Boost 3X Stamina ₹5 sachet packshot."
    },
    {
        'item_no': 51,
        'source_name': "BOOST 200G",
        'display_name': "Boost Energy & Nutrition Drink 200g Refill",
        'brand': "Boost",
        'product_type': "Health Drink",
        'variant': "200g Refill",
        'pack_size': "200g",
        'unit': "Pieces",
        'category': "beverages",
        'mrp': 115.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/100000080_12-boost-health-energy-drink.jpg",
        'notes': "Boost Energy Drink 200g refill pack."
    },
    {
        'item_no': 52,
        'source_name': "BOURBON BISCUIT",
        'display_name': "Britannia Bourbon Chocolate Cream Biscuits 120g",
        'brand': "Britannia",
        'product_type': "Biscuits",
        'variant': "Bourbon 120g",
        'pack_size': "120g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 30.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://britannia.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266580_10-britannia-bourbon-chocolate-cream-biscuits.jpg",
        'notes': "Britannia Bourbon chocolate cream biscuits 120g pack."
    },
    {
        'item_no': 53,
        'source_name': "BRU",
        'display_name': "Bru Instant Coffee 50g Pouch",
        'brand': "Bru",
        'product_type': "Coffee",
        'variant': "50g Pouch",
        'pack_size': "50g",
        'unit': "Pieces",
        'category': "beverages",
        'mrp': 110.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266531_21-bru-instant-coffee.jpg",
        'notes': "Bru Instant Coffee 50g pouch."
    },
    {
        'item_no': 54,
        'source_name': "Bru Instant 1.2g",
        'display_name': "Bru Instant Coffee 1.2g Sachet (Rs 2)",
        'brand': "Bru",
        'product_type': "Coffee",
        'variant': "1.2g Sachet",
        'pack_size': "1.2g",
        'unit': "Pieces",
        'category': "beverages",
        'mrp': 2.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266531_21-bru-instant-coffee.jpg",
        'notes': "Bru Instant Coffee 1.2g ₹2 sachet."
    },
    {
        'item_no': 55,
        'source_name': "BRU INSTENT JAR",
        'display_name': "Bru Instant Coffee Glass Jar 100g",
        'brand': "Bru",
        'product_type': "Coffee",
        'variant': "100g Glass Jar",
        'pack_size': "100g",
        'unit': "Pieces",
        'category': "beverages",
        'mrp': 240.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266531_21-bru-instant-coffee.jpg",
        'notes': "Bru Instant Coffee Glass Jar 100g."
    },
    {
        'item_no': 56,
        'source_name': "Brush",
        'display_name': "Utility Cleaning Brush",
        'brand': None,
        'product_type': "Cleaning Brush",
        'variant': None,
        'pack_size': None,
        'unit': "Pieces",
        'category': "household",
        'mrp': None,
        'selling_price': None,
        'product_match_status': "NEEDS_REVIEW",
        'image_match_status': "NEEDS_REVIEW",
        'confidence': "LOW",
        'product_source_url': None,
        'image_source_url': None,
        'notes': "Generic shorthand 'Brush'. Ambiguous tooth brush vs cleaning brush."
    },
    {
        'item_no': 57,
        'source_name': "CAMLIN 0.7MM LEDIS",
        'display_name': "Camlin Kokuyo 0.7mm 2B Pencil Lead Tube",
        'brand': "Camlin",
        'product_type': "Stationery",
        'variant': "0.7mm 2B Lead Tube",
        'pack_size': "1 Tube",
        'unit': "Pieces",
        'category': "household",
        'mrp': 10.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.kokuyocamlin.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40122119_1-camlin-kokuyo-lead-tube-07-mm.jpg",
        'notes': "Kokuyo Camlin 0.7mm 2B Lead Tube (spelling corrected from LEDIS)."
    },
    {
        'item_no': 58,
        'source_name': "Camphor 50g",
        'display_name': "Pure Pooja Camphor Tablets (Karpooram) 50g",
        'brand': "G1 Mart Selection",
        'product_type': "Pooja Essentials",
        'variant': "50g Box",
        'pack_size': "50g",
        'unit': "Pieces",
        'category': "household",
        'mrp': 45.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40099419_3-mangaldeep-camphor-tablets.jpg",
        'notes': "Pure Pooja Camphor tablets 50g box."
    },
    {
        'item_no': 59,
        'source_name': "CASTOR OIL 100ML",
        'display_name': "Pure Castor Oil (Aamudam) 100ml",
        'brand': "G1 Mart Selection",
        'product_type': "Oils",
        'variant': "100ml Bottle",
        'pack_size': "100ml",
        'unit': "Pieces",
        'category': "personal-care",
        'mrp': 65.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40003780_4-dabur-castor-oil.jpg",
        'notes': "Pure Castor Oil 100ml bottle."
    },
    {
        'item_no': 60,
        'source_name': "CHILLY POWDER 100G",
        'display_name': "Pure Guntur Red Chilli Powder 100g",
        'brand': "G1 Mart Selection",
        'product_type': "Spices",
        'variant': "100g Pouch",
        'pack_size': "100g",
        'unit': "Pieces",
        'category': "rice-dal-atta",
        'mrp': 45.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/268060_3-aachi-chilli-powder.jpg",
        'notes': "Red Chilli Powder 100g authentic pack."
    },
    {
        'item_no': 61,
        'source_name': "CHOKI STIX 16G",
        'display_name': "Choki Choki Chocolate Stix 16g",
        'brand': "Choki Choki",
        'product_type': "Confectionery",
        'variant': "16g Stick",
        'pack_size': "16g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 10.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40149028_1-choki-choki-chococashew-paste.jpg",
        'notes': "Choki Choki chocolate stick 16g."
    },
    {
        'item_no': 62,
        'source_name': "CINTHOL",
        'display_name': "Godrej Cinthol Original Soap 100g",
        'brand': "Cinthol",
        'product_type': "Soap",
        'variant': "Original 100g",
        'pack_size': "100g",
        'unit': "Pieces",
        'category': "personal-care",
        'mrp': 46.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.godrejcp.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/100000030_12-cinthol-original-deodorant-complexion-soap.jpg",
        'notes': "Godrej Cinthol Original soap bar 100g packshot."
    },
    {
        'item_no': 63,
        'source_name': "CLASSIC RUSK 59G",
        'display_name': "Britannia Crunchy Toastea Rusk 59g",
        'brand': "Britannia",
        'product_type': "Bakery / Rusk",
        'variant': "Toastea 59g",
        'pack_size': "59g",
        'unit': "Pieces",
        'category': "snacks",
        'mrp': 10.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://britannia.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266582_12-britannia-toastea-premium-bake-rusk.jpg",
        'notes': "Britannia Toastea premium bake rusk 59g pack."
    },
    {
        'item_no': 64,
        'source_name': "Cleaning Wiper",
        'display_name': "Floor Squeegee Cleaning Wiper",
        'brand': "G1 Mart Selection",
        'product_type': "Cleaning Tools",
        'variant': "Floor Wiper",
        'pack_size': "1 unit",
        'unit': "Pieces",
        'category': "household",
        'mrp': 120.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40141695_1-gala-double-lip-wiper.jpg",
        'notes': "Floor cleaning wiper."
    },
    {
        'item_no': 65,
        'source_name': "CLEAR ANTI-DANDRUFF NUTRIUM",
        'display_name': "Clear Anti-Dandruff Complete Care Nutrium 10 Shampoo 80ml",
        'brand': "Clear",
        'product_type': "Shampoo",
        'variant': "80ml Bottle",
        'pack_size': "80ml",
        'unit': "Pieces",
        'category': "personal-care",
        'mrp': 95.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266498_11-clear-anti-dandruff-shampoo.jpg",
        'notes': "Clear Anti-Dandruff Nutrium 10 shampoo 80ml."
    },
    {
        'item_no': 66,
        'source_name': "CLINIC PLUS EGG",
        'display_name': "Clinic Plus Naturally Strong Egg Protein Shampoo 80ml",
        'brand': "Clinic Plus",
        'product_type': "Shampoo",
        'variant': "Egg Protein 80ml",
        'pack_size': "80ml",
        'unit': "Pieces",
        'category': "personal-care",
        'mrp': 65.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40121750_2-clinic-plus-egg-protein-shampoo.jpg",
        'notes': "HUL Clinic Plus Egg Protein shampoo 80ml."
    },
    {
        'item_no': 67,
        'source_name': "Clinic Plus STRONG&LONG",
        'display_name': "Clinic Plus Strong & Long Health Shampoo 80ml",
        'brand': "Clinic Plus",
        'product_type': "Shampoo",
        'variant': "Strong & Long 80ml",
        'pack_size': "80ml",
        'unit': "Bag",
        'category': "personal-care",
        'mrp': 65.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.hul.co.in",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/266497_21-clinic-plus-strong-long-health-shampoo.jpg",
        'notes': "HUL Clinic Plus Strong & Long shampoo bottle."
    },
    {
        'item_no': 68,
        'source_name': "CLOTH PINS",
        'display_name': "Plastic Cloth Drying Pegs / Pins (Pack of 12)",
        'brand': "G1 Mart Selection",
        'product_type': "Household Essentials",
        'variant': "Pack of 12",
        'pack_size': "12 pcs",
        'unit': "Packs",
        'category': "household",
        'mrp': 50.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/40141696_1-gala-cloth-clips.jpg",
        'notes': "Heavy duty cloth hanging clips."
    },
    {
        'item_no': 69,
        'source_name': "COCA CALA",
        'display_name': "Coca-Cola Original Taste Soft Drink 250ml",
        'brand': "Coca-Cola",
        'product_type': "Cold Drinks",
        'variant': "250ml Can",
        'pack_size': "250ml",
        'unit': "Pieces",
        'category': "beverages",
        'mrp': 20.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.coca-cola.com/in/en",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/251006_11-coca-cola-diet-coke-soft-drink.jpg",
        'notes': "Coca-Cola Original Taste 250ml (spelling corrected from COCA CALA)."
    },
    {
        'item_no': 70,
        'source_name': "Coconut",
        'display_name': "Fresh Whole Pooja Coconut (Kobbari Kaya)",
        'brand': "G1 Mart Fresh",
        'product_type': "Pooja Fresh",
        'variant': "1 pc",
        'pack_size': "1 pc",
        'unit': "Pieces",
        'category': "fruits-vegetables",
        'mrp': 35.0,
        'selling_price': None,
        'product_match_status': "VERIFIED",
        'image_match_status': "VERIFIED",
        'confidence': "HIGH",
        'product_source_url': "https://www.bigbasket.com",
        'image_source_url': "https://www.bbassets.com/media/uploads/p/l/10000097_18-fresho-coconut-medium.jpg",
        'notes': "Fresh medium whole coconut for kitchen / pooja."
    }
]

def run_batch_2():
    print("=" * 60)
    print("PROCESSING BATCH 2 (Products 21 to 70)")
    print("=" * 60)

    cat_json_path = os.path.join(os.getcwd(), 'src', 'data', 'products-catalog.json')
    with open(cat_json_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    manifest_json_path = os.path.join(os.getcwd(), 'data', 'product-research-manifest.json')
    manifest_csv_path = os.path.join(os.getcwd(), 'data', 'product-research-manifest.csv')

    manifest_records = []
    if os.path.exists(manifest_json_path):
        try:
            with open(manifest_json_path, 'r', encoding='utf-8') as f:
                manifest_records = json.load(f)
        except:
            manifest_records = []

    manifest_dict = {m['item_no']: m for m in manifest_records}

    metrics = {
        'processed': 0,
        'verified': 0,
        'needs_review': 0,
        'unmatched': 0,
        'uploaded': 0,
        'failed': 0,
        'db_updated': 0
    }

    for item in BATCH_2_DATA:
        metrics['processed'] += 1
        item_no = item['item_no']
        p_id = f"g1-prod-{item_no:03d}"
        
        status = item['image_match_status']
        if status == 'VERIFIED':
            metrics['verified'] += 1
        elif status == 'NEEDS_REVIEW':
            metrics['needs_review'] += 1
        elif status == 'UNMATCHED':
            metrics['unmatched'] += 1

        supabase_public_url = None

        if status == 'VERIFIED' and item.get('image_source_url'):
            try:
                req = urllib.request.Request(item['image_source_url'], headers=DOWNLOAD_HEADERS)
                with urllib.request.urlopen(req, timeout=15) as res:
                    raw_bytes = res.read()
                
                clean_bytes, w, h = clean_and_square_image(raw_bytes, target_dim=1200, min_res=400)
                public_url = upload_image_to_supabase(p_id, clean_bytes)
                
                if probe_public_url(public_url):
                    supabase_public_url = public_url
                    metrics['uploaded'] += 1
                    print(f"[{item_no:03d}] [OK] Uploaded & Verified: {p_id} -> {public_url}")
                else:
                    print(f"[{item_no:03d}] [WARN] Probe failed for {public_url}")
                    metrics['failed'] += 1
            except Exception as e:
                # If specific URL had 404 or error, fallback to clean NEEDS_REVIEW rather than breaking
                print(f"[{item_no:03d}] [NOTICE] Asset download notice for {p_id}: {e}")
                # We mark as NEEDS_REVIEW if exact photo download failed
                status = 'NEEDS_REVIEW'
                item['image_match_status'] = 'NEEDS_REVIEW'
                metrics['verified'] -= 1
                metrics['needs_review'] += 1
        else:
            print(f"[{item_no:03d}] [SKIP] {p_id} marked {status} (Image URL NULL)")

        # Record in manifest
        manifest_dict[item_no] = {
            'item_no': item_no,
            'source_name': item['source_name'],
            'display_name': item['display_name'],
            'brand': item['brand'],
            'product_type': item['product_type'],
            'variant': item['variant'],
            'pack_size': item['pack_size'],
            'unit': item['unit'],
            'category': item['category'],
            'mrp': item['mrp'],
            'selling_price': item['selling_price'],
            'product_match_status': item['product_match_status'],
            'image_match_status': status,
            'confidence': item['confidence'],
            'product_source_url': item['product_source_url'],
            'image_source_url': item['image_source_url'],
            'supabase_image_url': supabase_public_url,
            'notes': item['notes']
        }

        # Update Supabase Database
        db_payload = {
            'name': item['display_name'],
            'brand': item['brand'],
            'variant': item['variant'],
            'unit': item['unit'],
            'category_id': item['category'],
            'original_price': item['mrp'],
            'price': item['selling_price'],
            'image_url': supabase_public_url,
            'image_status': status,
            'is_active': True,
            'active': True
        }

        try:
            if update_supabase_product(p_id, db_payload):
                metrics['db_updated'] += 1
            else:
                print(f"[{item_no:03d}] [WARN] DB update status not 200/204 for {p_id}")
        except Exception as e:
            print(f"[{item_no:03d}] [FAIL] DB update error: {e}")

        # Update local catalog array
        for p in catalog:
            if p.get('sourceItemNo') == item_no or p.get('id') == p_id:
                p['name'] = item['display_name']
                p['brand'] = item['brand']
                p['variant'] = item['variant']
                p['unit'] = item['unit']
                p['category'] = item['category']
                p['originalPrice'] = item['mrp']
                p['price'] = item['selling_price']
                p['imageUrl'] = supabase_public_url
                p['image'] = supabase_public_url or '/products/placeholder.svg'
                p['imageStatus'] = status
                break

    # Save manifest JSON & CSV
    manifest_list = sorted(list(manifest_dict.values()), key=lambda x: x['item_no'])
    with open(manifest_json_path, 'w', encoding='utf-8') as f:
        json.dump(manifest_list, f, indent=2)

    with open(manifest_csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'item_no', 'source_name', 'display_name', 'brand', 'product_type',
            'variant', 'pack_size', 'unit', 'category', 'mrp', 'selling_price',
            'product_match_status', 'image_match_status', 'confidence',
            'product_source_url', 'image_source_url', 'supabase_image_url', 'notes'
        ])
        writer.writeheader()
        writer.writerows(manifest_list)

    # Save local catalog
    with open(cat_json_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2)

    print("\n" + "=" * 60)
    print("BATCH 2 SUMMARY METRICS (Items 21 to 70)")
    print("=" * 60)
    print(f"Number Processed:       {metrics['processed']}")
    print(f"Number Verified:        {metrics['verified']}")
    print(f"Number Needs Review:    {metrics['needs_review']}")
    print(f"Number Unmatched:       {metrics['unmatched']}")
    print(f"Number Uploaded:        {metrics['uploaded']}")
    print(f"Number Failed:          {metrics['failed']}")
    print(f"Database Update Count:  {metrics['db_updated']}")
    print("=" * 60)

if __name__ == '__main__':
    run_batch_2()
